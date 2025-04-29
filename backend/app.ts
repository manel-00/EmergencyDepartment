import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(express.json());

app.post('/api/analyze-symptoms', (req, res) => {
  try {
    const { symptoms } = req.body;
    
    // Read intents file
    const intents = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'data/intents.json'), 'utf8')
    );

    const responses = [];
    
    // Check each symptom pattern
    for (const intent of intents.intents) {
      for (const pattern of intent.patterns) {
        if (symptoms.toLowerCase().includes(pattern.toLowerCase())) {
          responses.push(intent.responses[0]);
          break;
        }
      }
    }

    res.json({ responses });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
}); 