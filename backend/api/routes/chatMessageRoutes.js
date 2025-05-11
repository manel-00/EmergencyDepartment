const express = require('express');
const router = express.Router();
const chatMessageController = require('../controllers/chatMessageController');
const auth = require('../middleware/auth');

// Protéger toutes les routes avec l'authentification
router.use(auth);

// Routes pour les messages de chat
router.post('/', chatMessageController.createMessage);
router.get('/consultation/:consultationId', chatMessageController.getMessagesByConsultation);
router.delete('/:messageId', chatMessageController.deleteMessage);

module.exports = router;
