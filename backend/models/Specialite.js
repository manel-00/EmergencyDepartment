const mongoose = require('mongoose');

// Définir le schéma pour la spécialité
const specialitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // On veut garantir que chaque spécialité soit unique
  },
  description: {
    type: String,
    default: '', // Description optionnelle
  },
  creationDate: {
    type: Date,
    default: Date.now,
  }
});

// Créer le modèle basé sur le schéma
const Speciality = mongoose.model('Speciality', specialitySchema);

module.exports = Speciality;
