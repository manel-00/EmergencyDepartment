const mongoose = require('mongoose');

const rendezVousSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['planifié', 'confirmé', 'annulé', 'terminé'],
        default: 'planifié'
    },
    typeConsultation: {
        type: String,
        required: true
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
    rappels: [{
        type: Date,
        required: false
    }],
    notes: {
        type: String
    },
    consultation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Consultation'
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

rendezVousSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('RendezVous', rendezVousSchema); 