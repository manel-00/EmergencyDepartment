const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');
const auth = require('../middleware/auth');

// Routes protégées par authentification
router.use(auth);

// Routes pour les statistiques de téléconsultation
router.get('/doctor/:doctorId/daily', statisticsController.getDailyStatsByDoctor);
router.get('/doctor/:doctorId/monthly', statisticsController.getMonthlyStatsByDoctor);
router.get('/doctor/:doctorId/yearly', statisticsController.getYearlyStatsByDoctor);
router.get('/overall', statisticsController.getOverallStats);

module.exports = router;
