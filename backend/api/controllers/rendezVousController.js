const mongoose = require('mongoose');
const RendezVous = require('../../models/RendezVous');
const Consultation = require('../../models/Consultation');
const User = require('../../models/User');
const googleCalendarController = require('./googleCalendarController');

// Créer un nouveau rendez-vous
exports.createRendezVous = async (req, res) => {
    try {
        console.log('Création de rendez-vous - Données reçues:', req.body);
        console.log('Utilisateur authentifié:', req.user);

        // Vérifier que req.user et req.user._id existent
        if (!req.user) {
            console.error('Utilisateur non authentifié');
            return res.status(401).json({
                message: 'Utilisateur non authentifié'
            });
        }

        // Vérifier que l'ID utilisateur existe
        if (!req.user._id) {
            console.error('ID utilisateur manquant dans le token');
            console.error('Contenu du token:', req.user);
            return res.status(401).json({
                message: 'ID utilisateur manquant dans le token'
            });
        }

        // Convertir l'ID en chaîne si ce n'est pas déjà le cas
        const userId = req.user._id.toString ? req.user._id.toString() : String(req.user._id);

        // Déterminer le rôle de l'utilisateur
        const userRole = req.user.role || 'patient'; // Par défaut, considérer comme patient

        console.log(`Utilisateur authentifié: ID=${userId}, Rôle=${userRole}`);
        console.log(`Utilisateur: ID=${userId}, Rôle=${userRole}`);

        // Vérifier que les données requises sont présentes
        if (!req.body.date) {
            console.error('Date manquante dans la requête');
            return res.status(400).json({
                message: 'La date du rendez-vous est requise'
            });
        }

        if (!req.body.typeConsultation) {
            console.error('Type de consultation manquant dans la requête');
            return res.status(400).json({
                message: 'Le type de consultation est requis'
            });
        }

        // Vérifier si un médecin est spécifié, sinon en assigner un automatiquement
        if (!req.body.medecin) {
            console.log('Aucun médecin spécifié, recherche d\'un médecin disponible...');
            try {
                // Logique pour trouver un médecin disponible
                // Pour l'instant, on prend simplement le premier médecin trouvé
                const availableDoctor = await User.findOne({ role: { $in: ['doctor', 'medecin'] } });

                if (availableDoctor) {
                    req.body.medecin = availableDoctor._id;
                    console.log(`Médecin assigné automatiquement: ${availableDoctor._id}`);
                } else {
                    console.error('Aucun médecin disponible trouvé');
                    return res.status(400).json({
                        message: 'Aucun médecin disponible. Veuillez réessayer plus tard.'
                    });
                }
            } catch (doctorError) {
                console.error('Erreur lors de la recherche d\'un médecin disponible:', doctorError);
                return res.status(500).json({
                    message: 'Erreur lors de l\'assignation d\'un médecin. Veuillez réessayer.'
                });
            }
        }

        // Vérifier si le médecin a déjà un rendez-vous à cette date et heure
        try {
            const appointmentDate = new Date(req.body.date);

            // Créer une plage de temps pour la vérification (30 minutes avant et après)
            const startTime = new Date(appointmentDate);
            startTime.setMinutes(startTime.getMinutes() - 30);

            const endTime = new Date(appointmentDate);
            endTime.setMinutes(endTime.getMinutes() + 30);

            console.log(`Vérification de disponibilité du médecin ${req.body.medecin} entre ${startTime} et ${endTime}`);

            // Rechercher les rendez-vous existants pour ce médecin dans cette plage horaire
            const existingAppointments = await RendezVous.find({
                medecin: req.body.medecin,
                date: { $gte: startTime, $lte: endTime },
                status: { $nin: ['annulé', 'cancelled'] } // Ignorer les rendez-vous annulés
            });

            if (existingAppointments.length > 0) {
                console.error('Le médecin a déjà un rendez-vous à cette date et heure');
                return res.status(400).json({
                    message: 'Le médecin sélectionné n\'est pas disponible à cette date et heure. Veuillez choisir un autre créneau horaire.'
                });
            }

            console.log('Le médecin est disponible à cette date et heure');
        } catch (availabilityError) {
            console.error('Erreur lors de la vérification de disponibilité du médecin:', availabilityError);
            return res.status(500).json({
                message: 'Erreur lors de la vérification de disponibilité du médecin. Veuillez réessayer.'
            });
        }

        // Vérifier que l'utilisateur est autorisé à créer ce rendez-vous
        // Un patient ne peut créer un rendez-vous que pour lui-même
        if (userRole === 'patient' && req.body.patient) {
            const patientId = req.body.patient ?
                (typeof req.body.patient === 'object' && req.body.patient !== null ?
                    req.body.patient.toString() : req.body.patient)
                : null;

            if (patientId && patientId !== userId) {
                console.error(`Tentative non autorisée: patient ${userId} essaie de créer un rendez-vous pour ${patientId}`);
                return res.status(403).json({
                    message: 'Vous n\'êtes pas autorisé à créer un rendez-vous pour un autre patient'
                });
            }
        }

        // Si c'est un patient qui crée le rendez-vous, s'assurer que son ID est utilisé
        if (userRole === 'patient') {
            req.body.patient = userId;
        }

        // Si aucun patient n'est spécifié, utiliser l'ID de l'utilisateur connecté
        if (!req.body.patient) {
            req.body.patient = userId;
            console.log(`Patient non spécifié, utilisation de l'ID utilisateur connecté: ${userId}`);
        }

        console.log('Données finales pour la création du rendez-vous:', req.body);

        // Créer et sauvegarder le rendez-vous
        const rendezVous = new RendezVous(req.body);
        await rendezVous.save();
        console.log('Rendez-vous créé avec succès:', rendezVous);

        // Check if doctor has Google Calendar integration enabled
        try {
            const doctor = await User.findById(rendezVous.medecin);
            console.log('Vérification de l\'intégration Google Calendar pour le médecin:', doctor ? doctor._id : 'non trouvé');

            if (doctor && doctor.googleCalendarEnabled && doctor.googleCalendarTokens) {
                console.log('Ajout du rendez-vous au calendrier Google...');
                // Add appointment to Google Calendar
                const calendarEvent = await googleCalendarController.addAppointmentToCalendar(
                    rendezVous.medecin,
                    rendezVous
                );

                if (calendarEvent && calendarEvent.id) {
                    // Update rendezVous with Google Calendar event ID
                    rendezVous.googleCalendarEventId = calendarEvent.id;
                    await rendezVous.save();
                    console.log(`Rendez-vous ajouté au calendrier Google avec l'ID: ${calendarEvent.id}`);
                }
            } else {
                console.log('Intégration Google Calendar non activée pour ce médecin');
            }
        } catch (calendarError) {
            // Log the error but don't fail the appointment creation
            console.error('Erreur lors de l\'ajout au calendrier Google:', calendarError);
        }

        res.status(201).json(rendezVous);
    } catch (error) {
        console.error('Erreur lors de la création du rendez-vous:', error);

        // Vérifier si c'est une erreur de validation Mongoose
        if (error.name === 'ValidationError') {
            const validationErrors = {};

            // Extraire les messages d'erreur pour chaque champ
            for (const field in error.errors) {
                validationErrors[field] = error.errors[field].message;
            }

            return res.status(400).json({
                message: 'Erreur de validation des données',
                errors: validationErrors
            });
        }

        res.status(500).json({
            message: error.message || 'Une erreur est survenue lors de la création du rendez-vous'
        });
    }
};

// Obtenir tous les rendez-vous
exports.getAllRendezVous = async (req, res) => {
    try {
        console.log('🔍 getAllRendezVous - Début de la fonction');
        console.log('🔍 Headers reçus:', req.headers);

        // Vérifier que req.user et req.user._id existent
        if (!req.user) {
            console.error('❌ Utilisateur non authentifié - req.user est undefined ou null');
            return res.status(401).json({
                message: 'Utilisateur non authentifié'
            });
        }

        if (!req.user._id) {
            console.log('⚠️ ID utilisateur manquant dans req.user - mode débogage activé');
            req.user = {
                _id: 'debug-user',
                role: 'debug',
                name: 'Debug',
                lastname: 'User'
            };
        }

        console.log('✅ Utilisateur authentifié:', req.user ? JSON.stringify(req.user, null, 2) : 'Mode débogage');

        // Gérer le cas du mode débogage
        let userId = 'debug-user';
        let userRole = 'debug';

        if (req.user._id) {
            userId = req.user._id.toString ? req.user._id.toString() : String(req.user._id);
            userRole = req.user.role || 'patient';
        }
        let query = {};

        console.log(`✅ Utilisateur: ID=${userId}, Rôle=${userRole}`);

        // Filtrer les rendez-vous en fonction du rôle de l'utilisateur
        if (userRole === 'debug') {
            // Mode débogage - ne pas filtrer les rendez-vous
            console.log('Mode débogage activé - récupération de tous les rendez-vous');
            // Pas de filtre
        } else if (userRole === 'doctor' || userRole === 'medecin') {
            // Les médecins ne voient que leurs propres rendez-vous
            query = { medecin: userId };
            console.log('Requête pour un médecin:', query);
        } else if (userRole === 'patient') {
            // Les patients ne voient que leurs propres rendez-vous
            query = { patient: userId };
            console.log('Requête pour un patient:', query);
        } else if (userRole === 'admin') {
            // Les administrateurs peuvent voir tous les rendez-vous
            console.log('Requête pour un administrateur: tous les rendez-vous');
            // Pas de filtre supplémentaire
        } else {
            console.error('Rôle non autorisé:', userRole);
            return res.status(403).json({ message: 'Accès non autorisé' });
        }

        console.log('🔍 Exécution de la requête MongoDB:', query);

        try {
            console.log('🔍 Tentative de récupération des rendez-vous avec la requête:', JSON.stringify(query));

            // Vérifier d'abord si la collection existe
            const collections = await mongoose.connection.db.listCollections().toArray();
            const collectionNames = collections.map(c => c.name);
            console.log('📊 Collections disponibles dans la base de données:', collectionNames);

            // Vérifier le nom réel de la collection RendezVous
            const rendezVousCollectionName = collectionNames.find(name =>
                name.toLowerCase().includes('rendezvous') ||
                name.toLowerCase().includes('rendez-vous') ||
                name.toLowerCase().includes('rdv')
            );

            if (rendezVousCollectionName) {
                console.log(`✅ Collection de rendez-vous trouvée: ${rendezVousCollectionName}`);
            } else {
                console.error('❌ Aucune collection de rendez-vous trouvée dans la base de données');
            }

            const rendezVous = await RendezVous.find(query)
                .populate('medecin', 'name lastname image')
                .populate('patient', 'name lastname')
                .populate('consultation');

            console.log('✅ Nombre de rendez-vous trouvés:', rendezVous.length);

            if (rendezVous.length > 0) {
                console.log('✅ Premier rendez-vous:', JSON.stringify(rendezVous[0], null, 2));
            } else {
                console.log('⚠️ Aucun rendez-vous trouvé pour la requête:', JSON.stringify(query));
            }

            // Vérifier si des rendez-vous ont été trouvés
            if (rendezVous.length === 0) {
                console.log('Aucun rendez-vous trouvé pour la requête:', query);

                // Essayer de trouver tous les rendez-vous sans filtre
                console.log('Tentative de récupération de tous les rendez-vous sans filtre...');
                const allRendezVous = await RendezVous.find({})
                    .populate('medecin', 'name lastname image')
                    .populate('patient', 'name lastname')
                    .populate('consultation');

                console.log(`${allRendezVous.length} rendez-vous trouvés au total dans la base de données`);

                if (allRendezVous.length > 0) {
                    console.log('Premier rendez-vous trouvé:', JSON.stringify(allRendezVous[0], null, 2));

                    // Transformer les données pour le format attendu par le frontend
                    const transformedRendezVous = allRendezVous.map(rdv => {
                        const rdvObj = rdv.toObject();

                        // Transformer les données du médecin
                        if (rdvObj.medecin) {
                            rdvObj.medecin = {
                                ...rdvObj.medecin,
                                nom: rdvObj.medecin.lastname || '',
                                prenom: rdvObj.medecin.name || ''
                            };
                        } else {
                            rdvObj.medecin = {
                                _id: '',
                                nom: 'Non assigné',
                                prenom: '',
                                image: '/images/default-avatar.png'
                            };
                        }

                        // Transformer les données du patient
                        if (rdvObj.patient) {
                            rdvObj.patient = {
                                ...rdvObj.patient,
                                nom: rdvObj.patient.lastname || '',
                                prenom: rdvObj.patient.name || ''
                            };
                        } else {
                            rdvObj.patient = {
                                _id: '',
                                nom: 'Non assigné',
                                prenom: ''
                            };
                        }

                        return rdvObj;
                    });

                    console.log('Renvoi de tous les rendez-vous trouvés:', transformedRendezVous);
                    return res.json(transformedRendezVous);
                }

                // Si aucun rendez-vous n'est trouvé, renvoyer un tableau vide
                console.log('Aucun rendez-vous trouvé dans la base de données');
                return res.json([]);
            }

            // Transformer les données pour le format attendu par le frontend
            const transformedRendezVous = rendezVous.map(rdv => {
                const rdvObj = rdv.toObject();

                // Transformer les données du médecin
                if (rdvObj.medecin) {
                    rdvObj.medecin = {
                        ...rdvObj.medecin,
                        nom: rdvObj.medecin.lastname || '',
                        prenom: rdvObj.medecin.name || ''
                    };
                } else {
                    console.warn('Rendez-vous sans médecin:', rdvObj._id);
                    rdvObj.medecin = {
                        _id: '',
                        nom: 'Non assigné',
                        prenom: '',
                        image: '/images/default-avatar.png'
                    };
                }

                // Transformer les données du patient
                if (rdvObj.patient) {
                    rdvObj.patient = {
                        ...rdvObj.patient,
                        nom: rdvObj.patient.lastname || '',
                        prenom: rdvObj.patient.name || ''
                    };
                } else {
                    console.warn('Rendez-vous sans patient:', rdvObj._id);
                    rdvObj.patient = {
                        _id: '',
                        nom: 'Non assigné',
                        prenom: ''
                    };
                }

                // S'assurer que les autres propriétés requises existent
                if (!rdvObj.status) rdvObj.status = 'planifié';
                if (!rdvObj.typeConsultation && rdvObj.type) rdvObj.typeConsultation = rdvObj.type;
                if (!rdvObj.typeConsultation && !rdvObj.type) rdvObj.typeConsultation = 'Non spécifié';

                return rdvObj;
            });

            console.log('Rendez-vous transformés:', JSON.stringify(transformedRendezVous, null, 2));
            res.json(transformedRendezVous);
        } catch (dbError) {
            console.error('Erreur lors de la requête MongoDB:', dbError);
            res.status(500).json({ message: 'Erreur lors de la récupération des rendez-vous', error: dbError.message });
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des rendez-vous:', error);
        res.status(500).json({ message: error.message });
    }
};

// Obtenir un rendez-vous par ID
exports.getRendezVousById = async (req, res) => {
    try {
        const rendezVous = await RendezVous.findById(req.params.id)
            .populate('medecin', 'name lastname image')
            .populate('patient', 'name lastname')
            .populate('consultation');
        if (!rendezVous) {
            return res.status(404).json({ message: 'Rendez-vous non trouvé' });
        }

        // Transformer les données pour le format attendu par le frontend
        const rdvObj = rendezVous.toObject();

        // Transformer les données du médecin
        if (rdvObj.medecin) {
            rdvObj.medecin = {
                ...rdvObj.medecin,
                nom: rdvObj.medecin.lastname,
                prenom: rdvObj.medecin.name
            };
        }

        // Transformer les données du patient
        if (rdvObj.patient) {
            rdvObj.patient = {
                ...rdvObj.patient,
                nom: rdvObj.patient.lastname,
                prenom: rdvObj.patient.name
            };
        }

        res.json(rdvObj);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mettre à jour un rendez-vous
exports.updateRendezVous = async (req, res) => {
    try {
        // Vérifier que req.user et req.user._id existent
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                message: 'Utilisateur non authentifié ou ID utilisateur manquant'
            });
        }

        const userId = req.user._id.toString();
        const userRole = req.user.role;

        // Get the rendez-vous before update to check if it has a Google Calendar event
        const oldRendezVous = await RendezVous.findById(req.params.id);
        if (!oldRendezVous) {
            return res.status(404).json({ message: 'Rendez-vous non trouvé' });
        }

        // Vérifier que l'utilisateur est autorisé à mettre à jour ce rendez-vous
        const medecinId = oldRendezVous.medecin ?
            (typeof oldRendezVous.medecin === 'object' && oldRendezVous.medecin !== null ?
                oldRendezVous.medecin.toString() : oldRendezVous.medecin)
            : null;
        const patientId = oldRendezVous.patient ?
            (typeof oldRendezVous.patient === 'object' && oldRendezVous.patient !== null ?
                oldRendezVous.patient.toString() : oldRendezVous.patient)
            : null;

        if (
            ((userRole === 'doctor' || userRole === 'medecin') && medecinId !== userId) &&
            (userRole === 'patient' && patientId !== userId)
        ) {
            return res.status(403).json({
                message: 'Vous n\'êtes pas autorisé à modifier ce rendez-vous'
            });
        }

        // Si c'est un patient qui modifie le rendez-vous, s'assurer qu'il ne change pas le patient
        if (userRole === 'patient' && req.body.patient) {
            const patientId = req.body.patient ?
                (typeof req.body.patient === 'object' && req.body.patient !== null ?
                    req.body.patient.toString() : req.body.patient)
                : null;
            if (patientId && patientId !== userId) {
                return res.status(403).json({
                    message: 'Vous n\'êtes pas autorisé à modifier le patient du rendez-vous'
                });
            }
        }

        // Si c'est un médecin qui modifie le rendez-vous, s'assurer qu'il ne change pas le médecin
        if ((userRole === 'doctor' || userRole === 'medecin') && req.body.medecin) {
            const medecinId = req.body.medecin ?
                (typeof req.body.medecin === 'object' && req.body.medecin !== null ?
                    req.body.medecin.toString() : req.body.medecin)
                : null;
            if (medecinId && medecinId !== userId) {
                return res.status(403).json({
                    message: 'Vous n\'êtes pas autorisé à modifier le médecin du rendez-vous'
                });
            }
        }

        // Update the rendez-vous
        const rendezVous = await RendezVous.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        // Check if doctor has Google Calendar integration enabled and if the rendez-vous has a Google Calendar event
        if (oldRendezVous.googleCalendarEventId) {
            try {
                const doctor = await User.findById(rendezVous.medecin);

                if (doctor && doctor.googleCalendarEnabled && doctor.googleCalendarTokens) {
                    // Update the Google Calendar event
                    await googleCalendarController.updateAppointmentInCalendar(
                        rendezVous.medecin,
                        rendezVous,
                        oldRendezVous.googleCalendarEventId
                    );
                    console.log(`Rendez-vous mis à jour dans le calendrier Google avec l'ID: ${oldRendezVous.googleCalendarEventId}`);
                }
            } catch (calendarError) {
                // Log the error but don't fail the appointment update
                console.error('Erreur lors de la mise à jour dans le calendrier Google:', calendarError);
            }
        } else {
            // If the rendez-vous doesn't have a Google Calendar event, try to create one
            try {
                const doctor = await User.findById(rendezVous.medecin);

                if (doctor && doctor.googleCalendarEnabled && doctor.googleCalendarTokens) {
                    // Add appointment to Google Calendar
                    const calendarEvent = await googleCalendarController.addAppointmentToCalendar(
                        rendezVous.medecin,
                        rendezVous
                    );

                    if (calendarEvent && calendarEvent.id) {
                        // Update rendezVous with Google Calendar event ID
                        rendezVous.googleCalendarEventId = calendarEvent.id;
                        await rendezVous.save();
                        console.log(`Rendez-vous ajouté au calendrier Google avec l'ID: ${calendarEvent.id}`);
                    }
                }
            } catch (calendarError) {
                // Log the error but don't fail the appointment update
                console.error('Erreur lors de l\'ajout au calendrier Google:', calendarError);
            }
        }

        res.json(rendezVous);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Supprimer un rendez-vous
exports.deleteRendezVous = async (req, res) => {
    try {
        // Vérifier que req.user et req.user._id existent
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                message: 'Utilisateur non authentifié ou ID utilisateur manquant'
            });
        }

        const userId = req.user._id.toString();
        const userRole = req.user.role;

        // Get the rendez-vous before deletion to check if it has a Google Calendar event
        const rendezVous = await RendezVous.findById(req.params.id);
        if (!rendezVous) {
            return res.status(404).json({ message: 'Rendez-vous non trouvé' });
        }

        // Vérifier que l'utilisateur est autorisé à supprimer ce rendez-vous
        const medecinId = rendezVous.medecin ?
            (typeof rendezVous.medecin === 'object' && rendezVous.medecin !== null ?
                rendezVous.medecin.toString() : rendezVous.medecin)
            : null;
        const patientId = rendezVous.patient ?
            (typeof rendezVous.patient === 'object' && rendezVous.patient !== null ?
                rendezVous.patient.toString() : rendezVous.patient)
            : null;

        if (
            ((userRole === 'doctor' || userRole === 'medecin') && medecinId !== userId) &&
            (userRole === 'patient' && patientId !== userId)
        ) {
            return res.status(403).json({
                message: 'Vous n\'êtes pas autorisé à supprimer ce rendez-vous'
            });
        }

        // Check if the rendez-vous has a Google Calendar event
        if (rendezVous.googleCalendarEventId) {
            try {
                const doctor = await User.findById(rendezVous.medecin);

                if (doctor && doctor.googleCalendarEnabled && doctor.googleCalendarTokens) {
                    // Delete the Google Calendar event
                    await googleCalendarController.deleteAppointmentFromCalendar(
                        rendezVous.medecin,
                        rendezVous.googleCalendarEventId
                    );
                    console.log(`Rendez-vous supprimé du calendrier Google avec l'ID: ${rendezVous.googleCalendarEventId}`);
                }
            } catch (calendarError) {
                // Log the error but don't fail the appointment deletion
                console.error('Erreur lors de la suppression dans le calendrier Google:', calendarError);
            }
        }

        // Delete the rendez-vous
        await RendezVous.findByIdAndDelete(req.params.id);

        res.json({ message: 'Rendez-vous supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir les rendez-vous d'un médecin
exports.getRendezVousByMedecin = async (req, res) => {
    try {
        // Vérifier que req.user et req.user._id existent
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                message: 'Utilisateur non authentifié ou ID utilisateur manquant'
            });
        }

        const userId = req.user._id.toString();
        const userRole = req.user.role;
        const medecinId = req.params.medecinId;

        // Vérifier que l'utilisateur est autorisé à voir ces rendez-vous
        if ((userRole === 'doctor' || userRole === 'medecin') && userId !== medecinId) {
            return res.status(403).json({
                message: 'Vous n\'êtes pas autorisé à voir les rendez-vous d\'un autre médecin'
            });
        }

        // Si l'utilisateur est un patient, il ne peut pas voir les rendez-vous d'un médecin
        if (userRole === 'patient') {
            return res.status(403).json({
                message: 'Les patients ne sont pas autorisés à voir tous les rendez-vous d\'un médecin'
            });
        }

        const rendezVous = await RendezVous.find({ medecin: medecinId })
            .populate('patient', 'name lastname')
            .populate('consultation');

        // Transformer les données pour le format attendu par le frontend
        const transformedRendezVous = rendezVous.map(rdv => {
            const rdvObj = rdv.toObject();

            // Transformer les données du patient
            if (rdvObj.patient) {
                rdvObj.patient = {
                    ...rdvObj.patient,
                    nom: rdvObj.patient.lastname,
                    prenom: rdvObj.patient.name
                };
            }

            return rdvObj;
        });

        res.json(transformedRendezVous);
    } catch (error) {
        console.error('Erreur lors de la récupération des rendez-vous du médecin:', error);
        res.status(500).json({ message: error.message });
    }
};

// Obtenir les rendez-vous d'un patient
exports.getRendezVousByPatient = async (req, res) => {
    try {
        // Vérifier que req.user et req.user._id existent
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                message: 'Utilisateur non authentifié ou ID utilisateur manquant'
            });
        }

        const userId = req.user._id.toString();
        const userRole = req.user.role;
        const patientId = req.params.patientId;

        // Vérifier que l'utilisateur est autorisé à voir ces rendez-vous
        if (userRole === 'patient' && userId !== patientId) {
            return res.status(403).json({
                message: 'Vous n\'êtes pas autorisé à voir les rendez-vous d\'un autre patient'
            });
        }

        // Si l'utilisateur est un médecin, il ne peut voir que les rendez-vous des patients avec lui
        if (userRole === 'doctor' || userRole === 'medecin') {
            const rendezVous = await RendezVous.find({
                patient: patientId,
                medecin: userId
            })
            .populate('medecin', 'name lastname image')
            .populate('consultation');

            // Transformer les données pour le format attendu par le frontend
            const transformedRendezVous = rendezVous.map(rdv => {
                const rdvObj = rdv.toObject();

                // Transformer les données du médecin
                if (rdvObj.medecin) {
                    rdvObj.medecin = {
                        ...rdvObj.medecin,
                        nom: rdvObj.medecin.lastname,
                        prenom: rdvObj.medecin.name
                    };
                }

                return rdvObj;
            });

            return res.json(transformedRendezVous);
        }

        // Pour les administrateurs ou autres rôles autorisés
        const rendezVous = await RendezVous.find({ patient: patientId })
            .populate('medecin', 'name lastname image')
            .populate('consultation');

        // Transformer les données pour le format attendu par le frontend
        const transformedRendezVous = rendezVous.map(rdv => {
            const rdvObj = rdv.toObject();

            // Transformer les données du médecin
            if (rdvObj.medecin) {
                rdvObj.medecin = {
                    ...rdvObj.medecin,
                    nom: rdvObj.medecin.lastname,
                    prenom: rdvObj.medecin.name
                };
            }

            return rdvObj;
        });

        res.json(transformedRendezVous);
    } catch (error) {
        console.error('Erreur lors de la récupération des rendez-vous du patient:', error);
        res.status(500).json({ message: error.message });
    }
};

// Confirmer un rendez-vous
exports.confirmerRendezVous = async (req, res) => {
    try {
        // Vérifier que req.user et req.user._id existent
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                message: 'Utilisateur non authentifié ou ID utilisateur manquant'
            });
        }

        const userId = req.user._id.toString();
        const userRole = req.user.role;

        // Vérifier d'abord si le rendez-vous existe
        const rendezVous = await RendezVous.findById(req.params.id);
        if (!rendezVous) {
            return res.status(404).json({ message: 'Rendez-vous non trouvé' });
        }

        // Vérifier que l'utilisateur est autorisé à confirmer ce rendez-vous
        // Seul le médecin concerné peut confirmer un rendez-vous
        const medecinId = rendezVous.medecin ?
            (typeof rendezVous.medecin === 'object' && rendezVous.medecin !== null ?
                rendezVous.medecin.toString() : rendezVous.medecin)
            : null;

        if ((userRole === 'doctor' || userRole === 'medecin') && medecinId !== userId) {
            return res.status(403).json({
                message: 'Vous n\'êtes pas autorisé à confirmer ce rendez-vous'
            });
        }

        // Si l'utilisateur est un patient, il ne peut pas confirmer un rendez-vous
        if (userRole === 'patient') {
            return res.status(403).json({
                message: 'Les patients ne sont pas autorisés à confirmer un rendez-vous'
            });
        }

        // Mettre à jour le statut du rendez-vous
        const updatedRendezVous = await RendezVous.findByIdAndUpdate(
            req.params.id,
            { status: 'confirmé' },
            { new: true }
        );

        res.json(updatedRendezVous);
    } catch (error) {
        console.error('Erreur lors de la confirmation du rendez-vous:', error);
        res.status(400).json({ message: error.message });
    }
};

// Annuler un rendez-vous
exports.annulerRendezVous = async (req, res) => {
    try {
        // Vérifier que req.user et req.user._id existent
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                message: 'Utilisateur non authentifié ou ID utilisateur manquant'
            });
        }

        const userId = req.user._id.toString();
        const userRole = req.user.role;

        // Vérifier d'abord si le rendez-vous existe
        const rendezVous = await RendezVous.findById(req.params.id);
        if (!rendezVous) {
            return res.status(404).json({ message: 'Rendez-vous non trouvé' });
        }

        // Vérifier que l'utilisateur est autorisé à annuler ce rendez-vous
        // Le médecin concerné ou le patient concerné peut annuler un rendez-vous
        const medecinId = rendezVous.medecin ?
            (typeof rendezVous.medecin === 'object' && rendezVous.medecin !== null ?
                rendezVous.medecin.toString() : rendezVous.medecin)
            : null;
        const patientId = rendezVous.patient ?
            (typeof rendezVous.patient === 'object' && rendezVous.patient !== null ?
                rendezVous.patient.toString() : rendezVous.patient)
            : null;

        if (
            ((userRole === 'doctor' || userRole === 'medecin') && medecinId !== userId) &&
            (userRole === 'patient' && patientId !== userId)
        ) {
            return res.status(403).json({
                message: 'Vous n\'êtes pas autorisé à annuler ce rendez-vous'
            });
        }

        // Mettre à jour le statut du rendez-vous
        const updatedRendezVous = await RendezVous.findByIdAndUpdate(
            req.params.id,
            { status: 'annulé' },
            { new: true }
        );

        res.json(updatedRendezVous);
    } catch (error) {
        console.error('Erreur lors de l\'annulation du rendez-vous:', error);
        res.status(400).json({ message: error.message });
    }
};