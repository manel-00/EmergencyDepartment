const mongoose = require('mongoose');
const RendezVous = require('../models/RendezVous');
const User = require('../models/User');
require('dotenv').config();

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connecté à MongoDB'))
.catch(err => {
    console.error('Erreur de connexion à MongoDB:', err);
    process.exit(1);
});

const createTestRendezVous = async () => {
    try {
        // Vérifier si la collection existe
        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);
        console.log('Collections disponibles dans la base de données:', collectionNames);

        // Trouver tous les utilisateurs
        console.log('Recherche d\'utilisateurs...');
        const users = await User.find({});
        console.log(`${users.length} utilisateurs trouvés`);

        if (users.length === 0) {
            console.error('Aucun utilisateur trouvé dans la base de données');
            process.exit(1);
        }

        // Afficher tous les utilisateurs avec leurs rôles
        users.forEach(user => {
            console.log(`Utilisateur: ${user._id}, Nom: ${user.name} ${user.lastname}, Rôle: ${user.role}`);
        });

        // Trouver un médecin
        let medecin = users.find(user => user.role === 'doctor' || user.role === 'medecin');
        if (!medecin) {
            console.error('Aucun médecin trouvé dans la base de données');
            // Utiliser le premier utilisateur comme médecin
            medecin = users[0];
            console.log('Utilisation du premier utilisateur comme médecin:', medecin._id);
        } else {
            console.log('Médecin trouvé:', medecin._id, medecin.name, medecin.lastname);
        }

        // Trouver un patient
        let patient = users.find(user => user.role === 'patient');
        if (!patient) {
            console.error('Aucun patient trouvé dans la base de données');
            // Utiliser le deuxième utilisateur comme patient
            patient = users.length > 1 ? users[1] : users[0];
            console.log('Utilisation d\'un utilisateur comme patient:', patient._id);
        } else {
            console.log('Patient trouvé:', patient._id, patient.name, patient.lastname);
        }

        // Créer un rendez-vous de test
        const rendezVous = new RendezVous({
            date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Demain
            status: 'planifié',
            typeConsultation: 'video',
            medecin: medecin._id,
            patient: patient._id,
            notes: 'Rendez-vous de test créé par script'
        });

        console.log('Tentative de sauvegarde du rendez-vous...');
        await rendezVous.save();
        console.log('Rendez-vous de test créé avec succès:', rendezVous);

        // Vérifier si le rendez-vous a été créé
        const savedRendezVous = await RendezVous.findById(rendezVous._id)
            .populate('medecin', 'name lastname')
            .populate('patient', 'name lastname');

        console.log('Rendez-vous sauvegardé et récupéré:', savedRendezVous);

        // Créer un deuxième rendez-vous pour le même jour mais plus tard
        const rendezVous2 = new RendezVous({
            date: new Date(Date.now() + 25 * 60 * 60 * 1000), // Demain + 1 heure
            status: 'planifié',
            typeConsultation: 'audio',
            medecin: medecin._id,
            patient: patient._id,
            notes: 'Deuxième rendez-vous de test'
        });

        console.log('Tentative de sauvegarde du deuxième rendez-vous...');
        await rendezVous2.save();
        console.log('Deuxième rendez-vous de test créé avec succès:', rendezVous2);

        // Vérifier tous les rendez-vous dans la base de données
        console.log('Vérification de tous les rendez-vous dans la base de données...');
        const allRendezVous = await RendezVous.find({})
            .populate('medecin', 'name lastname')
            .populate('patient', 'name lastname');

        console.log(`${allRendezVous.length} rendez-vous trouvés dans la base de données:`);
        allRendezVous.forEach((rdv, index) => {
            console.log(`Rendez-vous ${index + 1}:`, rdv);
        });

        mongoose.disconnect();
        console.log('Déconnecté de MongoDB');
    } catch (error) {
        console.error('Erreur lors de la création des rendez-vous de test:', error);
        mongoose.disconnect();
        process.exit(1);
    }
};

createTestRendezVous();
