const express = require('express');
const Speciality = require('../models/Specialite');

// Créer une nouvelle spécialité
exports.createSpeciality = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Vérification si la spécialité existe déjà
    const existingSpeciality = await Speciality.findOne({ name });
    if (existingSpeciality) {
      return res.status(400).json({ message: "Specialty already exists" });
    }

    const newSpeciality = new Speciality({ name, description });
    await newSpeciality.save();
    res.status(201).json({ message: "Specialty created", speciality: newSpeciality });
  } catch (error) {
    res.status(500).json({ message: "Error creating specialty", error });
  }
};

// Lire toutes les spécialités
exports.getAllSpecialities = async (req, res) => {
  try {
    const specialities = await Speciality.find();
    res.status(200).json(specialities);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving specialties", error });
  }
};

// Mettre à jour une spécialité
exports.updateSpeciality = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const speciality = await Speciality.findById(id);
    if (!speciality) {
      return res.status(404).json({ message: "Specialty not found" });
    }

    speciality.name = name || speciality.name;
    speciality.description = description || speciality.description;

    await speciality.save();
    res.status(200).json({ message: "Specialty updated", speciality });
  } catch (error) {
    res.status(500).json({ message: "Error updating specialty", error });
  }
};

// Supprimer une spécialité
exports.deleteSpeciality = async (req, res) => {
    const { id } = req.params;
  
    try {
      const speciality = await Speciality.findByIdAndDelete(id); // Utilisation de findByIdAndDelete
  
      if (!speciality) {
        return res.status(404).json({ message: "Specialty not found" });
      }
  
      res.status(200).json({ message: "Specialty deleted" });
    } catch (error) {
      console.error('Erreur lors de la suppression :', error); // Log de l'erreur
      res.status(500).json({ message: "Error deleting specialty", error });
    }
  };
  
  // Récupérer une spécialité par ID
exports.getSpecialityById = async (req, res) => {
  const { id } = req.params;

  try {
    const speciality = await Speciality.findById(id);
    
    if (!speciality) {
      return res.status(404).json({ message: "Specialty not found" });
    }

    res.status(200).json(speciality);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving specialty", error });
  }
};


// Créer un routeur et ajouter les routes
const router = express.Router();

// Définir les routes
router.post('/addspecialite', exports.createSpeciality);
router.get('/getspecialite', exports.getAllSpecialities);
router.put('/updatespecialite/:id', exports.updateSpeciality);
router.delete('/deletespecialite/:id', exports.deleteSpeciality);
router.get('/getspecialite/:id', exports.getSpecialityById);

module.exports = router;
