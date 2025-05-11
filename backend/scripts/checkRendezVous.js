const mongoose = require('mongoose');
const RendezVous = require('../models/RendezVous');
const User = require('../models/User');
require('dotenv').config();

// Connexion à MongoDB
console.log('Tentative de connexion à MongoDB...');

// URI MongoDB par défaut si la variable d'environnement n'est pas définie
const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/emergency-department';
console.log('URI MongoDB:', MONGODB_URI);

const checkRendezVous = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connecté à MongoDB');
    } catch (err) {
        console.error('Erreur de connexion à MongoDB:', err);
        process.exit(1);
    }
    try {
        // Vérifier si la collection existe
        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);
        console.log('Collections disponibles dans la base de données:', collectionNames);

        // Vérifier le nom réel de la collection RendezVous
        const rendezVousCollectionName = collectionNames.find(name =>
            name.toLowerCase().includes('rendezvous') ||
            name.toLowerCase().includes('rendez-vous') ||
            name.toLowerCase().includes('rdv')
        );

        if (rendezVousCollectionName) {
            console.log(`Collection de rendez-vous trouvée: ${rendezVousCollectionName}`);
        } else {
            console.log('Aucune collection de rendez-vous trouvée');
        }

        // Vérifier tous les rendez-vous dans la base de données
        console.log('Vérification de tous les rendez-vous dans la base de données...');
        const allRendezVous = await RendezVous.find({});

        console.log(`${allRendezVous.length} rendez-vous trouvés dans la base de données:`);

        if (allRendezVous.length === 0) {
            console.log('Aucun rendez-vous trouvé dans la base de données');
        } else {
            // Afficher les détails de chaque rendez-vous
            for (const rdv of allRendezVous) {
                console.log('-----------------------------------');
                console.log(`ID: ${rdv._id}`);
                console.log(`Date: ${rdv.date}`);
                console.log(`Type: ${rdv.typeConsultation}`);
                console.log(`Status: ${rdv.status}`);
                console.log(`Notes: ${rdv.notes}`);

                // Récupérer les informations du médecin
                if (rdv.medecin) {
                    try {
                        const medecin = await User.findById(rdv.medecin);
                        if (medecin) {
                            console.log(`Médecin: ${medecin.name} ${medecin.lastname} (${medecin._id})`);
                        } else {
                            console.log(`Médecin: ID ${rdv.medecin} (non trouvé dans la base de données)`);
                        }
                    } catch (err) {
                        console.log(`Erreur lors de la récupération du médecin: ${err.message}`);
                    }
                } else {
                    console.log('Médecin: Non assigné');
                }

                // Récupérer les informations du patient
                if (rdv.patient) {
                    try {
                        const patient = await User.findById(rdv.patient);
                        if (patient) {
                            console.log(`Patient: ${patient.name} ${patient.lastname} (${patient._id})`);
                        } else {
                            console.log(`Patient: ID ${rdv.patient} (non trouvé dans la base de données)`);
                        }
                    } catch (err) {
                        console.log(`Erreur lors de la récupération du patient: ${err.message}`);
                    }
                } else {
                    console.log('Patient: Non assigné');
                }
            }
        }

        mongoose.disconnect();
        console.log('Déconnecté de MongoDB');
    } catch (error) {
        console.error('Erreur lors de la vérification des rendez-vous:', error);
        mongoose.disconnect();
        process.exit(1);
    }
};

checkRendezVous();
