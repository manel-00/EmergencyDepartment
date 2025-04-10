const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const jwt = require("jsonwebtoken");
const axios = require('axios');

// Définition du modèle Document
const DocumentSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  type: { type: String, required: true },
  contenu: { type: String, required: true },
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  date_upload: { type: Date, default: Date.now }
});

const Document = mongoose.model('Document', DocumentSchema);

// 📌 Contrôleurs
const ajouter = async (req, res) => {
  try {
    console.log("Données reçues:", req.body);

    const { name, type, contenu, patient_id } = req.body;
    if (!name || !type || !contenu || !patient_id) {
      return res.status(400).json({ message: "Tous les champs sont requis : nom, type, contenu, patient_id" });
    }

    if (!mongoose.Types.ObjectId.isValid(patient_id)) {
      return res.status(400).json({ message: "patient_id invalide" });
    }

    const newDocument = new Document({ nom:name, type, contenu, patient_id });
    await newDocument.save();

    res.status(201).json({ message: "Document ajouté", document: newDocument });
  } catch (error) {
    console.error("Erreur lors de l'ajout du document:", error);
    res.status(500).json({ message: "Erreur serveur, veuillez réessayer plus tard." });
  }
};

const mettreAJour = async (req, res) => {
  const { id } = req.params;
  const { nom, type, contenu } = req.body;
  try {
    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ message: "Document non trouvé" });
    }

    document.nom = nom || document.nom;
    document.type = type || document.type;
    document.contenu = contenu || document.contenu;
    await document.save();

    res.status(200).json({ message: "Document mis à jour", document });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour du document", error });
  }
};
const supprimer = async (req, res) => {
  const { id } = req.params;
  try {
    const document = await Document.findByIdAndDelete(id);
    if (!document) {
      return res.status(404).json({ message: "Document non trouvé" });
    }
    res.status(200).json({ message: "Document supprimé" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression du document", error });
  }
};
const getDocuments = async (req, res) => {
  try {
    let token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    console.log("token", token);
    if (!token) {
      console.log("❌ No session and no token found.");
      return res.status(401).json({ status: "FAILED", message: "No active session" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decoded", decoded);
    
    if (!decoded) {
      console.log("❌ decoded not valid.");
      return res.status(401).json({ status: "FAILED", message: "No active session" });
    }

    if (decoded.role === "doctor" || decoded.role === "admin") {
      const documents = await Document.find();
      res.status(200).json(documents);
    } else if (decoded.role === "patient") {
      // Patients can only see their own documents
      const documents = await Document.find({ patient_id: decoded.userId });
      res.status(200).json(documents);
    } else {
      return res.status(401).json({ status: "FAILED", message: "Unauthorized access" });
    }
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ message: "Error fetching documents", error });
  }
}
  const getDocumentById = async (req, res) => {
    try {
      let token = req.cookies.token || req.headers.authorization?.split(" ")[1];
      console.log("token", token);
      if (!token) {
        console.log("❌ No session and no token found.");
        return res.status(401).json({ status: "FAILED", message: "No active session" });
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("decoded", decoded);
      
      if (!decoded) {
        console.log("❌ decoded not valid.");
        return res.status(401).json({ status: "FAILED", message: "No active session" });
      }
  
      const { id } = req.params;
      const document = await Document.findById(id);
      if (!document) {
        return res.status(404).json({ message: "Document non trouvé" });
      }
  
      if (decoded.role === "doctor" || decoded.role === "admin" ) {
        res.status(200).json(document);
      } else {
        return res.status(401).json({ status: "FAILED", message: "Unauthorized access" });
      }
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération du document", error });
    }
};
const getMedicine = async (req, res) => {
  try {
    // Get the brand name from query parameters
    const { brand_name } = req.query;
    
    if (!brand_name) {
      return res.status(400).json({ message: "Le paramètre brand_name est requis" });
    }
    
    // Build the FDA API URL
    const url = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:${encodeURIComponent(brand_name)}&limit=1`;
    
    // Make request to FDA API
    const response = await axios.get(url);
    
    // Return the data
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Erreur lors de la récupération des données médicament:", error);
    
    // Check if it's an FDA API error with response
    if (error.response) {
      // FDA API returns 404 when no results are found
      if (error.response.status === 404) {
        return res.status(404).json({ message: "Aucun médicament trouvé avec ce nom" });
      }
      return res.status(error.response.status).json({ 
        message: "Erreur lors de la requête à l'API FDA", 
        error: error.response.data 
      });
    }
    
    res.status(500).json({ 
      message: "Erreur serveur lors de la récupération des données médicament", 
      error: error.message 
    });
  }
};
const getMedicineById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: "L'identifiant du médicament est requis" });
    }
    
    // Build the FDA API URL for getting a specific medicine by ID
    const url = `https://api.fda.gov/drug/label.json?search=openfda.spl_id:${encodeURIComponent(id)}&limit=1`;
    
    // Make request to FDA API
    const response = await axios.get(url);
    
    // Return the data
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Erreur lors de la récupération du médicament:", error);
    
    // Check if it's an FDA API error with response
    if (error.response) {
      if (error.response.status === 404) {
        return res.status(404).json({ message: "Médicament non trouvé avec cet ID" });
      }
      return res.status(error.response.status).json({ 
        message: "Erreur lors de la requête à l'API FDA", 
        error: error.response.data 
      });
    }
    
    res.status(500).json({ 
      message: "Erreur serveur lors de la récupération du médicament", 
      error: error.message 
    });
  }
};


// 📌 Routes
router.post('/ajouter', ajouter);
router.put('/edit/:id', mettreAJour);
router.delete('/delete/:id', supprimer);
router.get('/get', getDocuments);
router.get('/get/:id', getDocumentById);
router.get('/medicine', getMedicine);
router.get('/medicine/:id', getMedicineById);

module.exports = router;
