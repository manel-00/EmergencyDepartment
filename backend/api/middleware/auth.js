const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {
        // Récupérer le token depuis le header Authorization
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'Accès non autorisé. Token manquant.' });
        }

        try {
            // Vérifier et décoder le token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Token décodé:', decoded);

            // Normaliser l'objet utilisateur pour s'assurer que req.user._id existe
            const normalizedUser = {
                ...decoded,
                _id: decoded._id || decoded.userId || decoded.id || decoded.sub
            };

            // Vérifier que le token décodé contient un ID utilisateur
            if (!normalizedUser._id) {
                console.error('Token décodé invalide - pas d\'ID utilisateur:', decoded);
                return res.status(401).json({ message: 'Token invalide: informations utilisateur manquantes.' });
            }

            // Ajouter l'utilisateur décodé normalisé à la requête
            req.user = normalizedUser;
            console.log('Utilisateur authentifié:', req.user);
            next();
        } catch (jwtError) {
            console.error('Erreur de vérification JWT:', jwtError);
            return res.status(401).json({ message: 'Token invalide ou expiré.' });
        }
    } catch (error) {
        console.error('Erreur d\'authentification:', error);
        res.status(500).json({ message: 'Erreur serveur lors de l\'authentification.' });
    }
};

module.exports = auth;