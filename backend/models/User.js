const mongoose = require('mongoose');
// Définir le schéma pour l'utilisateur
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },  // Prénom
    lastname: { type: String, required: true },  // Nom de famille
    role: { type: String, required: true },  // Rôle (ex. docteur, patient, admin, etc.)
    email: { type: String, required: true, unique: true },  // Email de l'utilisateur
    password: { type: String },  // Mot de passe
    creationDate: { type: Date, default: Date.now },  // Date de création du compte
    verified: { type: Boolean, default: false },  // Vérification du compte
    specialty: { type: mongoose.Schema.Types.ObjectId, ref: 'Specialty' },  
    image: { type: String, default: null },  // Image de profil, par défaut null
    googleId: { type: String, unique: true, sparse: true }, // Google OAuth ID
    facebookId: { type: String, unique: true, sparse: true }, // Facebook OAuth ID
});

// Créer le modèle User basé sur le schéma
const User = mongoose.model('User', userSchema);

module.exports = User;  // Exporter le modèle User
