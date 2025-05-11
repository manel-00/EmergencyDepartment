const mongoose = require('mongoose');

const paiementSchema = new mongoose.Schema({
    montant: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['en attente', 'payé', 'annulé', 'remboursé'],
        default: 'en attente'
    },
    date: {
        type: Date,
        default: Date.now
    },
    consultation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Consultation',
        required: true
    },
    methodePaiement: {
        type: String,
        required: true
    },
    transactionId: {
        type: String
    },
    remboursement: {
        montant: Number,
        date: Date,
        raison: String
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

paiementSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Paiement', paiementSchema); 