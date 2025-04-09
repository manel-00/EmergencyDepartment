const Paiement = require('../../models/Paiement');
const Consultation = require('../../models/Consultation');

// Créer un nouveau paiement
exports.createPaiement = async (req, res) => {
    try {
        const paiement = new Paiement(req.body);
        await paiement.save();
        
        // Mettre à jour la consultation avec le paiement
        await Consultation.findByIdAndUpdate(
            req.body.consultation,
            { paiement: paiement._id }
        );
        
        res.status(201).json(paiement);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Obtenir tous les paiements
exports.getAllPaiements = async (req, res) => {
    try {
        const paiements = await Paiement.find()
            .populate('consultation');
        res.json(paiements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir un paiement par ID
exports.getPaiementById = async (req, res) => {
    try {
        const paiement = await Paiement.findById(req.params.id)
            .populate('consultation');
        if (!paiement) {
            return res.status(404).json({ message: 'Paiement non trouvé' });
        }
        res.json(paiement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mettre à jour un paiement
exports.updatePaiement = async (req, res) => {
    try {
        const paiement = await Paiement.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!paiement) {
            return res.status(404).json({ message: 'Paiement non trouvé' });
        }
        res.json(paiement);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Supprimer un paiement
exports.deletePaiement = async (req, res) => {
    try {
        const paiement = await Paiement.findByIdAndDelete(req.params.id);
        if (!paiement) {
            return res.status(404).json({ message: 'Paiement non trouvé' });
        }
        res.json({ message: 'Paiement supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir les paiements d'une consultation
exports.getPaiementsByConsultation = async (req, res) => {
    try {
        const paiements = await Paiement.find({ consultation: req.params.consultationId });
        res.json(paiements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mettre à jour le statut d'un paiement
exports.updatePaiementStatus = async (req, res) => {
    try {
        const paiement = await Paiement.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        if (!paiement) {
            return res.status(404).json({ message: 'Paiement non trouvé' });
        }
        res.json(paiement);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}; 