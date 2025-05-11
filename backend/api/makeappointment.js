const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const mongoose = require('mongoose');
const auth = require('../middleware/authMiddleware');

// Prendre un rendez-vous
router.post('/', auth, async (req, res) => {
  try {
    const { doctorId, userId, date, time } = req.body;
    const requestUserId = req.user._id.toString(); // ID de l'utilisateur authentifié

    // Vérifier que l'utilisateur crée un rendez-vous pour lui-même
    if (userId !== requestUserId) {
      return res.status(403).json({
        success: false,
        message: "Vous n'êtes pas autorisé à créer un rendez-vous pour un autre utilisateur.",
      });
    }

    // Validation des données
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({
        success: false,
        message: "ID médecin invalide"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "ID utilisateur invalide"
      });
    }

    // Vérifier la disponibilité
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date,
      time,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        message: "Créneau déjà réservé"
      });
    }

    // Créer le rendez-vous
    const newAppointment = new Appointment({
      doctorId,
      userId,
      date: new Date(date),
      time,
      status: 'pending'
    });

    await newAppointment.save();

    res.status(201).json({
      success: true,
      message: "Rendez-vous créé avec succès",
      appointment: newAppointment
    });

  } catch (error) {
    console.error("Erreur création rendez-vous:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la création du rendez-vous",
      error: error.message
    });
  }
});
// Récupérer les rendez-vous de l'utilisateur avec leurs statuts
router.get('/appointments/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    const requestUserId = req.user._id.toString(); // ID de l'utilisateur authentifié

    // Vérifier que l'utilisateur demande ses propres rendez-vous
    if (userId !== requestUserId) {
      return res.status(403).json({
        success: false,
        message: "Vous n'êtes pas autorisé à accéder aux rendez-vous d'un autre utilisateur.",
      });
    }

    // Récupérer les rendez-vous pour l'utilisateur
    const appointments = await Appointment.find({ userId })
      .populate("doctorId", "name lastname") // Récupérer le nom et prénom du médecin
      .exec();

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Aucun rendez-vous trouvé pour cet utilisateur.",
      });
    }

    // Formater les données pour la réponse
    const appointmentData = appointments.map((appointment) => ({
      id: appointment._id.toString(),
      date: appointment.date.toISOString().split("T")[0], // Format de la date
      time: appointment.time,
      doctorName: `${appointment.doctorId.name} ${appointment.doctorId.lastname}`,
      status: appointment.status, // Ajout du statut du rendez-vous
    }));

    res.status(200).json(appointmentData);

  } catch (error) {
    console.error("Erreur lors de la récupération des rendez-vous:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des rendez-vous.",
      error: error.message,
    });
  }
});
router.delete('/:id', auth, async (req, res) => {
  const appointmentId = req.params.id;
  const requestUserId = req.user._id.toString(); // ID de l'utilisateur authentifié
  const userRole = req.user.role; // Rôle de l'utilisateur authentifié

  try {
    // Trouver le rendez-vous avant de le supprimer pour vérifier les autorisations
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: "Rendez-vous non trouvé." });
    }

    // Vérifier que l'utilisateur est autorisé à supprimer ce rendez-vous
    // Un patient ne peut supprimer que ses propres rendez-vous
    // Un médecin peut supprimer les rendez-vous où il est le médecin
    if (
      (userRole === 'patient' && appointment.userId.toString() !== requestUserId) ||
      (userRole === 'doctor' && appointment.doctorId.toString() !== requestUserId)
    ) {
      return res.status(403).json({
        message: "Vous n'êtes pas autorisé à supprimer ce rendez-vous."
      });
    }

    // Supprimer le rendez-vous
    await Appointment.findByIdAndDelete(appointmentId);

    res.status(200).json({ message: "Rendez-vous supprimé avec succès." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur lors de la suppression du rendez-vous." });
  }
});
router.get('/doctor/appointments/:doctorId', auth, async (req, res) => {
  try {
    const { doctorId } = req.params;
    const requestUserId = req.user._id.toString(); // ID de l'utilisateur authentifié
    const userRole = req.user.role; // Rôle de l'utilisateur authentifié

    // Vérifier que l'utilisateur est bien un médecin et qu'il demande ses propres rendez-vous
    if (userRole !== 'doctor' || doctorId !== requestUserId) {
      return res.status(403).json({
        success: false,
        message: "Vous n'êtes pas autorisé à accéder aux rendez-vous d'un autre médecin.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({
        success: false,
        message: "ID médecin invalide"
      });
    }

    // Récupérer les rendez-vous du médecin avec les infos du patient
    const appointments = await Appointment.find({ doctorId })
      .populate("userId", "name lastname email phone") // Charger les infos du patient
      .sort({ date: 1, time: 1 });

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Aucun rendez-vous trouvé pour ce médecin.",
      });
    }

    // Formater les données avant envoi
    const appointmentData = appointments.map((appointment) => ({
      id: appointment._id.toString(),
      date: appointment.date.toISOString().split("T")[0],
      time: appointment.time,
      patientName: `${appointment.userId.name} ${appointment.userId.lastname}`,
      patientEmail: appointment.userId.email,
      patientPhone: appointment.userId.phone || "Non renseigné",
      status: appointment.status,
    }));

    res.status(200).json(appointmentData);

  } catch (error) {
    console.error("Erreur lors de la récupération des rendez-vous du médecin :", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des rendez-vous.",
      error: error.message,
    });
  }
});

// Mettre à jour le statut d'un rendez-vous
router.put('/update-status/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const requestUserId = req.user._id.toString(); // ID de l'utilisateur authentifié
    const userRole = req.user.role; // Rôle de l'utilisateur authentifié

    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID du rendez-vous invalide"
      });
    }

    // Vérifier que le statut est valide
    const validStatuses = ["pending", "confirmed", "canceled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Statut invalide. Statuts autorisés : pending, confirmed, canceled"
      });
    }

    // Trouver le rendez-vous avant de le mettre à jour pour vérifier les autorisations
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Rendez-vous non trouvé"
      });
    }

    // Vérifier les autorisations
    // Seul un médecin peut confirmer un rendez-vous, et seulement ses propres rendez-vous
    if (userRole !== 'doctor' || appointment.doctorId.toString() !== requestUserId) {
      return res.status(403).json({
        success: false,
        message: "Vous n'êtes pas autorisé à modifier ce rendez-vous"
      });
    }

    // Mettre à jour le rendez-vous
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Statut du rendez-vous mis à jour avec succès",
      appointment: updatedAppointment
    });

  } catch (error) {
    console.error("Erreur lors de la mise à jour du rendez-vous :", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la mise à jour du rendez-vous.",
      error: error.message,
    });
  }
});


module.exports = router;