const express = require("express");
const router = express.Router();
const { spawn } = require("child_process");

router.post('/predict', (req, res) => {
    const input = req.body.input; // Ex : ["Male", "High", "Normal", ..., "45"]

    // Vérifiez si 'input' est un tableau valide
    if (!Array.isArray(input)) {
        return res.status(400).json({ error: "Le corps de la requête doit contenir un tableau 'input'." });
    }

    // Vérifiez que le nombre d'arguments dans 'input' correspond aux attentes
    const expectedInputLength = 9; // Le nombre d'arguments attendu dans le script Python
    if (input.length !== expectedInputLength) {
        return res.status(400).json({ error: `Le nombre d'arguments doit être ${expectedInputLength}, mais vous avez envoyé ${input.length}.` });
    }

    // Lancer le script Python en lui passant les éléments du tableau en tant qu'arguments
    const pythonProcess = spawn('python', ['ml/model.py', ...input]);

    let result = '';
    pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Erreur Python : ${data}`);
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            return res.status(500).json({ error: `Erreur lors de l'exécution du script Python (code : ${code})` });
        }

        // Affichez le résultat brut de la sortie du script Python
        console.log("Sortie du script Python:", result);

        // Extraction de la prédiction depuis la sortie Python
        const predictionMatch = result.match(/Pr�diction : (\w+)/);
        if (predictionMatch) {
            const prediction = predictionMatch[1]; // "Positive" ou "Negative"
            return res.json({ prediction });
        } else {
            return res.status(500).json({ error: "Impossible de récupérer la prédiction du script." });
        }
    });
});

module.exports = router;
