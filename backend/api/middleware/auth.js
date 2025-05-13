const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {
        // Récupérer le token depuis le header Authorization ou les cookies
        let token = req.cookies?.token;

        // Si pas de token dans les cookies, essayer le header Authorization
        if (!token) {
            const authHeader = req.header('Authorization');
            if (authHeader) {
                // Gérer les deux formats possibles: "Bearer <token>" ou juste "<token>"
                token = authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : authHeader;
            }
        }

        if (!token) {
            console.log('❌ Middleware auth: Token manquant');
            return res.status(401).json({ message: 'Accès non autorisé. Token manquant.' });
        }

        // Vérifier et décoder le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Ajouter l'utilisateur décodé à la requête
        req.user = decoded;

        // Log pour le débogage
        console.log(`✅ Middleware auth: Utilisateur authentifié - ID: ${decoded.userId || decoded._id}, Role: ${decoded.role}`);

        next();
    } catch (error) {
        console.error('❌ Middleware auth: Erreur de vérification du token', error.message);
        res.status(401).json({ message: 'Accès non autorisé. Token invalide.' });
    }
};

module.exports = auth;
