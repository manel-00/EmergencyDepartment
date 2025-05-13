const ChatMessage = require('../../models/ChatMessage');

// Créer un nouveau message
exports.createMessage = async (req, res) => {
  try {
    const { consultationId, text } = req.body;

    if (!consultationId || !text) {
      return res.status(400).json({ message: 'ConsultationId et text sont requis' });
    }

    console.log('Création de message - req.user:', req.user);

    // Vérifier que req.user existe et contient les informations nécessaires
    if (!req.user) {
      console.error('Erreur: req.user est manquant');
      return res.status(401).json({ message: 'Utilisateur non authentifié correctement' });
    }

    // Utiliser userId ou _id selon ce qui est disponible
    const userId = req.user.userId || req.user._id;
    if (!userId) {
      console.error('Erreur: ID utilisateur manquant dans le token', req.user);
      return res.status(401).json({ message: 'Token invalide - ID utilisateur manquant' });
    }

    // Assigner l'ID utilisateur pour une utilisation ultérieure
    req.user._id = userId;

    // Déterminer le nom de l'expéditeur en fonction des propriétés disponibles
    let senderName = 'Utilisateur';

    // Vérifier toutes les propriétés possibles pour le nom
    const possibleNameProps = ['name', 'prenom', 'nom', 'firstname', 'lastname'];
    for (const prop of possibleNameProps) {
      if (req.user[prop]) {
        senderName = req.user[prop];
        break;
      }
    }

    // Si on a un prénom et un nom, les combiner
    if (req.user.name && req.user.lastname) {
      senderName = `${req.user.name} ${req.user.lastname}`;
    } else if (req.user.firstname && req.user.lastname) {
      senderName = `${req.user.firstname} ${req.user.lastname}`;
    } else if (req.user.prenom && req.user.nom) {
      senderName = `${req.user.prenom} ${req.user.nom}`;
    }

    const message = new ChatMessage({
      consultationId,
      sender: req.user._id,
      senderName,
      text
    });

    await message.save();
    res.status(201).json(message);
  } catch (error) {
    console.error('Erreur lors de la création du message:', error);
    res.status(500).json({ message: error.message });
  }
};

// Récupérer les messages d'une consultation
exports.getMessagesByConsultation = async (req, res) => {
  try {
    const { consultationId } = req.params;

    if (!consultationId) {
      return res.status(400).json({ message: 'ConsultationId est requis' });
    }

    console.log(`Récupération des messages pour la consultation: ${consultationId}`);
    console.log('Utilisateur authentifié:', req.user);

    try {
      const messages = await ChatMessage.find({ consultationId })
        .sort({ timestamp: 1 })
        .populate('sender', 'name prenom nom lastname firstname')
        .lean();

      console.log(`${messages.length} messages trouvés pour la consultation ${consultationId}`);

      // Transformation des messages pour assurer la compatibilité
      const formattedMessages = messages.map(msg => {
        // Assurer que sender est un objet même s'il n'a pas été trouvé dans la base de données
        if (!msg.sender) {
          msg.sender = { _id: msg.sender || 'unknown' };
        }

        // Ajouter des informations de débogage
        console.log('Message formaté:', {
          id: msg._id,
          sender: msg.sender,
          senderName: msg.senderName,
          text: msg.text && msg.text.substring(0, 20) + (msg.text.length > 20 ? '...' : '')
        });

        return msg;
      });

      res.json(formattedMessages);
    } catch (dbError) {
      console.error('Erreur de base de données lors de la récupération des messages:', dbError);
      return res.status(500).json({ message: 'Erreur de base de données: ' + dbError.message });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    res.status(500).json({ message: error.message });
  }
};

// Supprimer un message
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await ChatMessage.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    // Vérifier que l'utilisateur est l'expéditeur du message
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Non autorisé à supprimer ce message' });
    }

    await ChatMessage.findByIdAndDelete(messageId);
    res.json({ message: 'Message supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du message:', error);
    res.status(500).json({ message: error.message });
  }
};
