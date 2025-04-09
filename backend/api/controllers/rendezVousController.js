const RendezVous = require('../../models/RendezVous');
const Consultation = require('../../models/Consultation');

// Créer un nouveau rendez-vous
exports.createRendezVous = async (req, res) => {
    try {
        const rendezVous = new RendezVous(req.body);
        await rendezVous.save();
        res.status(201).json(rendezVous);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Obtenir tous les rendez-vous
exports.getAllRendezVous = async (req, res) => {
    try {
        const rendezVous = await RendezVous.find()
            .populate('medecin', 'nom prenom')
            .populate('patient', 'nom prenom')
            .populate('consultation');
        res.json(rendezVous);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir un rendez-vous par ID
exports.getRendezVousById = async (req, res) => {
    try {
        const rendezVous = await RendezVous.findById(req.params.id)
            .populate('medecin', 'nom prenom')
            .populate('patient', 'nom prenom')
            .populate('consultation');
        if (!rendezVous) {
            return res.status(404).json({ message: 'Rendez-vous non trouvé' });
        }
        res.json(rendezVous);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mettre à jour un rendez-vous
exports.updateRendezVous = async (req, res) => {
    try {
        const rendezVous = await RendezVous.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!rendezVous) {
            return res.status(404).json({ message: 'Rendez-vous non trouvé' });
        }
        res.json(rendezVous);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Supprimer un rendez-vous
exports.deleteRendezVous = async (req, res) => {
    try {
        const rendezVous = await RendezVous.findByIdAndDelete(req.params.id);
        if (!rendezVous) {
            return res.status(404).json({ message: 'Rendez-vous non trouvé' });
        }
        res.json({ message: 'Rendez-vous supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir les rendez-vous d'un médecin
exports.getRendezVousByMedecin = async (req, res) => {
    try {
        const rendezVous = await RendezVous.find({ medecin: req.params.medecinId })
            .populate('patient', 'nom prenom')
            .populate('consultation');
        res.json(rendezVous);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir les rendez-vous d'un patient
exports.getRendezVousByPatient = async (req, res) => {
    try {
        const rendezVous = await RendezVous.find({ patient: req.params.patientId })
            .populate('medecin', 'nom prenom')
            .populate('consultation');
        res.json(rendezVous);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Confirmer un rendez-vous
exports.confirmerRendezVous = async (req, res) => {
    try {
        const rendezVous = await RendezVous.findByIdAndUpdate(
            req.params.id,
            { status: 'confirmé' },
            { new: true }
        );
        if (!rendezVous) {
            return res.status(404).json({ message: 'Rendez-vous non trouvé' });
        }
        res.json(rendezVous);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Annuler un rendez-vous
exports.annulerRendezVous = async (req, res) => {
    try {
        const rendezVous = await RendezVous.findByIdAndUpdate(
            req.params.id,
            { status: 'annulé' },
            { new: true }
        );
        if (!rendezVous) {
            return res.status(404).json({ message: 'Rendez-vous non trouvé' });
        }
        res.json(rendezVous);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}; 