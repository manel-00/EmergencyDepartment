const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticateUser = (req, res, next) => {
    console.log("⚙️ Middleware d'authentification en cours d'exécution");
    console.log("⚙️ Headers reçus:", req.headers);
    console.log("⚙️ Cookies reçus:", req.cookies);
    console.log("⚙️ URL demandée:", req.originalUrl);

    // Récupérer le token depuis différentes sources possibles
    let token = null;

    // 1. Depuis le header Authorization (format Bearer)
    const authHeader = req.headers.authorization || req.header("Authorization");
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.replace('Bearer ', '');
        console.log("⚙️ Token trouvé dans le header Authorization (Bearer):", token.substring(0, 20) + '...');
    }
    // 2. Depuis le header Authorization (sans Bearer)
    else if (authHeader) {
        token = authHeader;
        console.log("⚙️ Token trouvé dans le header Authorization (sans Bearer):", token.substring(0, 20) + '...');
    }
    // 3. Depuis les cookies
    else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
        console.log("⚙️ Token trouvé dans les cookies:", token.substring(0, 20) + '...');
    }

    // Pour les routes de rendez-vous, permettre l'accès même sans token pour le débogage
    if (!token) {
        console.log("❌ Aucun token trouvé");

        // Si la route concerne les rendez-vous, continuer sans authentification (pour le débogage)
        if (req.originalUrl.includes('/api/rendez-vous')) {
            console.log("⚠️ Accès à la route rendez-vous sans authentification (mode débogage)");
            req.user = { id: 'debug-user', role: 'debug' };
            return next();
        }

        return res.status(401).json({ message: "Utilisateur non authentifié ou ID utilisateur manquant" });
    }

    try {
        console.log("⚙️ Vérification du token JWT");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("✅ Token décodé:", decoded);

        // Normaliser l'objet utilisateur pour s'assurer que req.user._id existe
        req.user = {
            ...decoded,
            _id: decoded.userId || decoded._id || decoded.id || decoded.sub
        };

        if (!req.user._id) {
            console.log("❌ Impossible de déterminer l'ID utilisateur à partir du token");
            return res.status(401).json({ message: "Utilisateur non authentifié ou ID utilisateur manquant" });
        }

        console.log("✅ Utilisateur authentifié:", req.user);
        next();
    } catch (error) {
        console.log("❌ Erreur de vérification du token:", error.message);
        res.status(401).json({ message: "Token invalide ou expiré" });
    }
};

module.exports = authenticateUser;
