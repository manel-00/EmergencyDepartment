const Consultation = require('../../models/Consultation');
const Paiement = require('../../models/Paiement');
const RendezVous = require('../../models/RendezVous');

// Créer une nouvelle consultation
exports.createConsultation = async (req, res) => {
    try {
        const consultation = new Consultation(req.body);
        await consultation.save();
        res.status(201).json(consultation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Obtenir toutes les consultations
exports.getAllConsultations = async (req, res) => {
    try {
        const consultations = await Consultation.find()
            .populate('medecin', 'nom prenom')
            .populate('patient', 'nom prenom')
            .populate('paiement');
        res.json(consultations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir une consultation par ID
exports.getConsultationById = async (req, res) => {
    try {
        const consultation = await Consultation.findById(req.params.id)
            .populate('medecin', 'nom prenom')
            .populate('patient', 'nom prenom')
            .populate('paiement');
        if (!consultation) {
            return res.status(404).json({ message: 'Consultation non trouvée' });
        }
        res.json(consultation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mettre à jour une consultation
exports.updateConsultation = async (req, res) => {
    try {
        const consultation = await Consultation.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!consultation) {
            return res.status(404).json({ message: 'Consultation non trouvée' });
        }
        res.json(consultation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Supprimer une consultation
exports.deleteConsultation = async (req, res) => {
    try {
        const consultation = await Consultation.findByIdAndDelete(req.params.id);
        if (!consultation) {
            return res.status(404).json({ message: 'Consultation non trouvée' });
        }
        res.json({ message: 'Consultation supprimée avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir les consultations d'un médecin
exports.getConsultationsByMedecin = async (req, res) => {
    try {
        const consultations = await Consultation.find({ medecin: req.params.medecinId })
            .populate('patient', 'nom prenom')
            .populate('paiement');
        res.json(consultations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir les consultations d'un patient
exports.getConsultationsByPatient = async (req, res) => {
    try {
        const consultations = await Consultation.find({ patient: req.params.patientId })
            .populate('medecin', 'nom prenom')
            .populate('paiement');
        res.json(consultations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 