const express = require("express");
const router = express.Router();
const { spawn } = require("child_process");

router.post("/classify", (req, res) => {
    const message = req.body.message;

    // Vérifier si le message existe
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    console.log("Message reçu : ", message); // Log du message
  
    // Exécution du script Python avec le message
    const py = spawn("python", ["ml/predict.py", message]);

    let result = "";

    py.stdout.setEncoding("utf8");  // Forcer l'encodage UTF-8

    py.stdout.on("data", (data) => {
      result += data.toString();
    });

    py.stderr.on("data", (data) => {
      console.error(`Erreur Python: ${data.toString()}`);
    });

    py.on("close", (code) => {
      if (code !== 0) {
        return res.status(500).json({ error: "Erreur lors de l'exécution du script Python" });
      }

      console.log("Code de sortie Python : ", code);  // Log du code de sortie
      console.log("Résultat de Python : ", result); // Log du résultat de Python

      // Retourner la prédiction en réponse
      res.json({ prediction: result.trim() });
    });
});

module.exports = router;