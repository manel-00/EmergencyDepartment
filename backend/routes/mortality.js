const express = require('express');
const router = express.Router();
const { predictMortality } = require('../controllers/mortalityController');

// Handle both /api/mortality and /api/mortality/predict
router.post('/', predictMortality);
router.post('/predict', predictMortality);

module.exports = router; 