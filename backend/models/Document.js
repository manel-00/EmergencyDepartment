const mongoose = require('mongoose');

// Définir le schéma pour le document
const documentSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  contenu: {
    type: String,
    required: true,
  },
  patient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  date_upload: {
    type: Date,
    default: Date.now,
  }
});

// Créer le modèle basé sur le schéma
const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
