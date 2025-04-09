const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {
        // Récupérer le token depuis le header Authorization
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'Accès non autorisé. Token manquant.' });
        }

        // Vérifier et décoder le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Ajouter l'utilisateur décodé à la requête
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Accès non autorisé. Token invalide.' });
    }
};

module.exports = auth; 