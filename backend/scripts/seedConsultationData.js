const mongoose = require('mongoose');
const Consultation = require('../models/Consultation');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
console.log('Connecting to MongoDB...');
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/emergency-department';
console.log('MongoDB URI:', mongoURI);
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Function to generate random date within a range
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Function to generate random number within a range
const randomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// Function to generate sample consultation data
const generateSampleData = async () => {
  try {
    // Get all doctors
    const doctors = await User.find({ role: 'doctor' });

    if (doctors.length === 0) {
      console.error('No doctors found in the database');
      return;
    }

    // Get all patients
    const patients = await User.find({ role: 'patient' });

    if (patients.length === 0) {
      console.error('No patients found in the database');
      return;
    }

    console.log(`Found ${doctors.length} doctors and ${patients.length} patients`);

    // Delete existing consultations
    await Consultation.deleteMany({});
    console.log('Deleted existing consultations');

    // Generate sample consultations for the past 2 years
    const consultations = [];
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 2);
    const endDate = new Date();

    // Generate consultations for each doctor
    for (const doctor of doctors) {
      // Generate between 50-100 consultations per doctor
      const numConsultations = randomNumber(50, 100);

      for (let i = 0; i < numConsultations; i++) {
        const date = randomDate(startDate, endDate);
        const patient = patients[randomNumber(0, patients.length - 1)];
        const status = ['planifié', 'en cours', 'terminé', 'annulé'][randomNumber(0, 3)];
        const duree = randomNumber(15, 60);
        const prix = randomNumber(50, 200);

        consultations.push({
          date,
          status,
          medecin: doctor._id,
          patient: patient._id,
          typeConsultation: ['video', 'audio', 'chat'][randomNumber(0, 2)],
          duree,
          prix,
          notesMedicales: 'Sample medical notes',
          createdAt: date,
          updatedAt: date
        });
      }
    }

    // Insert consultations into the database
    await Consultation.insertMany(consultations);
    console.log(`Added ${consultations.length} sample consultations`);

    // Disconnect from MongoDB
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error generating sample data:', error);
    mongoose.disconnect();
  }
};

// Run the function
generateSampleData();
