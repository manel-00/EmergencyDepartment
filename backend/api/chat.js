const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Stocker l'historique des messages (facultatif, pour contexte)
let conversationHistory = [];

// Fonction pour filtrer les messages non médicaux
const isMedicalQuestion = (message) => {
  const medicalKeywords = [
    "maladie", "traitement", "symptômes", "diagnostic", "médicament", "consultation",
    "clinique", "médecin", "hôpital", "urgence", "chirurgie", "soins", "santé", "patients"
  ];
  
  return medicalKeywords.some(keyword => message.toLowerCase().includes(keyword));
};

router.post('/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;

    // Contexte médical pour limiter les réponses
    const prompt = `
      Tu es un assistant médical intelligent. Réponds uniquement aux questions liées à la santé, aux médicaments, aux symptômes et aux maladies.
      Si la question ne concerne pas la santé, réponds : "Je suis spécialisé en santé et ne peux répondre qu'à des questions médicales."
      Utilisateur : ${userMessage}
      Réponse :
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiMessage = await response.text();

    res.json({ message: aiMessage });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).send("Erreur lors de la génération de la réponse : " + error.message);
  }
});


module.exports = router;
