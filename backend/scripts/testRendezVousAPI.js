const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Fonction pour créer un token JWT valide
const createToken = (userId, role) => {
    return jwt.sign(
        { userId, role },
        process.env.JWT_SECRET || 'mySuperSecretKey',
        { expiresIn: '1h' }
    );
};

// Fonction pour tester l'API de rendez-vous
const testRendezVousAPI = async () => {
    try {
        // 1. Créer un token JWT pour un utilisateur de test
        console.log('1. Création d\'un token JWT pour un utilisateur de test...');
        const token = createToken('debug-user', 'debug');
        console.log('Token créé:', token);

        // 2. Tester l'API de rendez-vous avec ce token
        console.log('2. Test de l\'API de rendez-vous...');

        // Essayer d'abord avec le port 3001 (frontend)
        try {
            console.log('Tentative avec le port 3001...');
            const rendezVousResponse = await axios.get('http://localhost:3001/api/rendez-vous', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log('Réponse de l\'API (port 3001):', rendezVousResponse.status);
            return rendezVousResponse;
        } catch (error) {
            console.log('Erreur avec le port 3001:', error.message);
            console.log('Tentative avec le port 3000...');
        }

        // Essayer ensuite avec le port 3000 (backend)
        const rendezVousResponse = await axios.get('http://localhost:3000/api/rendez-vous', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log('Réponse de l\'API:', rendezVousResponse.data);

        if (Array.isArray(rendezVousResponse.data)) {
            console.log(`Nombre de rendez-vous trouvés: ${rendezVousResponse.data.length}`);

            if (rendezVousResponse.data.length > 0) {
                console.log('Premier rendez-vous:', JSON.stringify(rendezVousResponse.data[0], null, 2));
            } else {
                console.log('Aucun rendez-vous trouvé pour cet utilisateur');
            }
        } else {
            console.error('Format de réponse inattendu:', rendezVousResponse.data);
        }
    } catch (error) {
        console.error('Erreur lors du test de l\'API:', error.message);

        if (error.response) {
            console.error('Détails de l\'erreur:', {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers
            });
        }
    }
};

// Exécuter le test
testRendezVousAPI();
