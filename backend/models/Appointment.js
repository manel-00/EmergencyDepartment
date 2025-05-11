const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  doctorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: "User"  // Référence au modèle User pour le médecin
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: "User"  // Référence au modèle User pour le patient
  },
  date: { 
    type: Date, 
    required: true 
  },
  time: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    default: 'pending', 
    enum: ['pending', 'confirmed', 'cancelled'] 
  },
}, { timestamps: true });  // Option pour ajouter les champs `createdAt` et `updatedAt`

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
