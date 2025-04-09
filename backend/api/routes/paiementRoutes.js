const express = require('express');
const router = express.Router();
const paiementController = require('../controllers/paiementController');
const auth = require('../middleware/auth');

// Routes protégées par authentification
router.use(auth);

// Routes pour les paiements
router.post('/', paiementController.createPaiement);
router.get('/', paiementController.getAllPaiements);
router.get('/:id', paiementController.getPaiementById);
router.put('/:id', paiementController.updatePaiement);
router.delete('/:id', paiementController.deletePaiement);

// Routes spécifiques
router.get('/consultation/:consultationId', paiementController.getPaiementsByConsultation);
router.put('/:id/status', paiementController.updatePaiementStatus);

module.exports = router; 