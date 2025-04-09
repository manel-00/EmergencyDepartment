const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['planifié', 'en cours', 'terminé', 'annulé'],
        default: 'planifié'
    },
    medecin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    typeConsultation: {
        type: String,
        required: true
    },
    duree: {
        type: Number, // en minutes
        required: true
    },
    prix: {
        type: Number,
        required: true
    },
    notesMedicales: {
        type: String
    },
    documents: [{
        type: String, // URLs des documents
        required: false
    }],
    lienVisio: {
        type: String
    },
    paiement: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Paiement'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

consultationSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Consultation', consultationSchema); 