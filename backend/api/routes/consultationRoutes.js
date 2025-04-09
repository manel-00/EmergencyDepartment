const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/consultationController');
const auth = require('../middleware/auth');

// Routes protégées par authentification
router.use(auth);

// Routes pour les consultations
router.post('/', consultationController.createConsultation);
router.get('/', consultationController.getAllConsultations);
router.get('/:id', consultationController.getConsultationById);
router.put('/:id', consultationController.updateConsultation);
router.delete('/:id', consultationController.deleteConsultation);

// Routes spécifiques
router.get('/medecin/:medecinId', consultationController.getConsultationsByMedecin);
router.get('/patient/:patientId', consultationController.getConsultationsByPatient);

module.exports = router; 