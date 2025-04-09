const express = require('express');
const router = express.Router();
const rendezVousController = require('../controllers/rendezVousController');
const auth = require('../middleware/auth');

// Routes protégées par authentification
router.use(auth);

// Routes pour les rendez-vous
router.post('/', rendezVousController.createRendezVous);
router.get('/', rendezVousController.getAllRendezVous);
router.get('/:id', rendezVousController.getRendezVousById);
router.put('/:id', rendezVousController.updateRendezVous);
router.delete('/:id', rendezVousController.deleteRendezVous);

// Routes spécifiques
router.get('/medecin/:medecinId', rendezVousController.getRendezVousByMedecin);
router.get('/patient/:patientId', rendezVousController.getRendezVousByPatient);

// Actions sur les rendez-vous
router.put('/:id/confirmer', rendezVousController.confirmerRendezVous);
router.put('/:id/annuler', rendezVousController.annulerRendezVous);

module.exports = router; 