const axios = require('axios');

exports.predictMortality = async (req, res) => {
    try {
        const patientData = req.body;
        
        // Validate input data
        const requiredFields = ['Disease', 'Fever', 'Cough', 'Fatigue', 'Difficulty Breathing', 
                              'Age', 'Gender', 'Blood Pressure', 'Cholesterol Level'];
        
        for (const field of requiredFields) {
            if (!(field in patientData)) {
                return res.status(400).json({ error: `Missing required field: ${field}` });
            }
        }

        // Validate disease value
        const validDiseases = ['Influenza', 'Common Cold', 'Eczema', 'Asthma'];
        if (!validDiseases.includes(patientData.Disease)) {
            return res.status(400).json({ 
                error: `Invalid disease. Must be one of: ${validDiseases.join(', ')}` 
            });
        }

        // Validate gender value
        const validGenders = ['Male', 'Female'];
        if (!validGenders.includes(patientData.Gender)) {
            return res.status(400).json({ 
                error: `Invalid gender. Must be one of: ${validGenders.join(', ')}` 
            });
        }

        // Forward request to Python ML service
        const response = await axios.post('http://localhost:5000/predict', patientData);
        res.json(response.data);
    } catch (error) {
        console.error('Prediction error:', error);
        res.status(500).json({ 
            error: 'Error making prediction. Please ensure the ML service is running.' 
        });
    }
}; 