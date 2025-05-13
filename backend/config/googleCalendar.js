const { google } = require('googleapis');
require('dotenv').config();

// Configuration for Google Calendar API
// Utiliser des scopes plus spécifiques pour s'assurer que nous avons toutes les permissions nécessaires
// Réduire les scopes au minimum nécessaire pour éviter les refus d'accès
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events'
];
const REDIRECT_URI = process.env.GOOGLE_CALENDAR_REDIRECT_URI || 'http://localhost:3000/auth/google/callback';

// Create OAuth2 client
const createOAuth2Client = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = REDIRECT_URI;

  if (!clientId || !clientSecret) {
    console.error('Missing Google OAuth credentials in environment variables');
    throw new Error('Missing Google OAuth credentials');
  }

  console.log('Creating OAuth2 client with:', {
    clientId,
    clientSecret: clientSecret ? 'Present' : 'Missing',
    redirectUri
  });

  return new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );
};

// Generate authentication URL
const getAuthUrl = (state = null) => {
  const oauth2Client = createOAuth2Client();

  // Utiliser une configuration plus simple pour éviter les problèmes
  const options = {
    access_type: 'offline',
    scope: SCOPES,
    // Ajouter des options pour améliorer l'expérience utilisateur
    include_granted_scopes: false, // Ne pas inclure les scopes précédemment accordés
    prompt: 'select_account' // Permettre à l'utilisateur de sélectionner son compte
  };

  // Add state parameter if provided
  if (state) {
    options.state = state;
  }

  console.log('Generating auth URL with options:', options);
  const authUrl = oauth2Client.generateAuthUrl(options);
  console.log('Generated auth URL:', authUrl);
  return authUrl;
};

// Get tokens from code
const getTokens = async (code) => {
  console.log('Getting tokens with code:', code ? 'Code present' : 'No code');
  try {
    const oauth2Client = createOAuth2Client();
    console.log('OAuth2 client created for token exchange');

    const { tokens } = await oauth2Client.getToken(code);
    console.log('Tokens received:', {
      access_token_exists: !!tokens.access_token,
      refresh_token_exists: !!tokens.refresh_token,
      expiry_date: tokens.expiry_date
    });

    return tokens;
  } catch (error) {
    console.error('Error getting tokens:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    throw error;
  }
};

// Set credentials to OAuth2 client
const setCredentials = (tokens, userId) => {
  console.log('=== DÉBUT CONFIGURATION DES CREDENTIALS OAUTH2 ===');
  console.log('Tokens reçus:', {
    access_token_exists: !!tokens.access_token,
    refresh_token_exists: !!tokens.refresh_token,
    expiry_date: tokens.expiry_date
  });

  // Vérifier si le token est expiré
  const now = Date.now();
  const isExpired = tokens.expiry_date && tokens.expiry_date < now;
  console.log('Token expiré?', isExpired);

  const oauth2Client = createOAuth2Client();
  console.log('OAuth2 client créé');

  // Configurer le client avec les tokens
  oauth2Client.setCredentials(tokens);
  console.log('Credentials configurées sur le client OAuth2');

  // Configurer le gestionnaire de rafraîchissement de token
  oauth2Client.on('tokens', (newTokens) => {
    console.log('Nouveaux tokens reçus:', {
      access_token_exists: !!newTokens.access_token,
      refresh_token_exists: !!newTokens.refresh_token,
      expiry_date: newTokens.expiry_date
    });

    // Mettre à jour les tokens dans la base de données
    if (newTokens.refresh_token || newTokens.access_token) {
      console.log('Nouveaux tokens reçus - à mettre à jour dans la base de données');

      // Importer dynamiquement le contrôleur pour éviter les dépendances circulaires
      try {
        // Cette approche n'est pas idéale mais fonctionne pour notre cas
        const User = require('../models/User');

        // Mettre à jour les tokens dans la base de données
        if (userId) {
          console.log('Mise à jour des tokens pour l\'utilisateur:', userId);

          // Fusionner les nouveaux tokens avec les tokens existants
          User.findById(userId)
            .then(user => {
              if (!user) {
                console.error('Utilisateur non trouvé pour la mise à jour des tokens');
                return;
              }

              const updatedTokens = {
                ...user.googleCalendarTokens,
                ...newTokens
              };

              // Mettre à jour l'utilisateur
              return User.findByIdAndUpdate(userId, {
                googleCalendarTokens: updatedTokens
              });
            })
            .then(() => {
              console.log('Tokens mis à jour avec succès');
            })
            .catch(error => {
              console.error('Erreur lors de la mise à jour des tokens:', error);
            });
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour des tokens:', error);
      }
    }
  });

  console.log('=== FIN CONFIGURATION DES CREDENTIALS OAUTH2 ===');
  return oauth2Client;
};

// Create calendar event
const createCalendarEvent = async (auth, event) => {
  console.log('=== DÉBUT CRÉATION ÉVÉNEMENT GOOGLE CALENDAR ===');
  console.log('Auth object exists:', !!auth);

  if (auth) {
    console.log('Auth credentials:', {
      access_token_exists: !!auth.credentials.access_token,
      refresh_token_exists: !!auth.credentials.refresh_token,
      expiry_date: auth.credentials.expiry_date
    });
  }

  console.log('Event to create:', JSON.stringify(event, null, 2));

  // Vérifier si les dates sont valides
  try {
    const startDate = new Date(event.start.dateTime);
    const endDate = new Date(event.end.dateTime);
    console.log('Start date parsed:', startDate);
    console.log('End date parsed:', endDate);

    // S'assurer que les dates sont valides
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Invalid date format');
    }

    // S'assurer que la date de fin est après la date de début
    if (endDate <= startDate) {
      console.warn('End date is not after start date, adjusting...');
      endDate.setMinutes(startDate.getMinutes() + 30);
      event.end.dateTime = endDate.toISOString();
    }
  } catch (dateError) {
    console.error('Error parsing dates:', dateError);
    // Corriger les dates si nécessaire
    const now = new Date();
    const thirtyMinutesLater = new Date(now.getTime() + 30 * 60000);

    event.start = {
      dateTime: now.toISOString(),
      timeZone: 'Europe/Paris'
    };

    event.end = {
      dateTime: thirtyMinutesLater.toISOString(),
      timeZone: 'Europe/Paris'
    };

    console.log('Dates corrected to:', {
      start: event.start.dateTime,
      end: event.end.dateTime
    });
  }

  // Ajouter des options supplémentaires à l'événement
  event.transparency = 'opaque'; // Show as busy
  event.visibility = 'default'; // Default visibility
  event.status = 'confirmed'; // Status confirmed

  // S'assurer que les notifications sont configurées correctement
  if (!event.reminders || !event.reminders.overrides || event.reminders.overrides.length === 0) {
    event.reminders = {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 30 }
      ]
    };
  }

  // S'assurer que le résumé et la description existent
  if (!event.summary) {
    event.summary = 'Téléconsultation';
  }

  if (!event.description) {
    event.description = 'Rendez-vous de téléconsultation';
  }

  const calendar = google.calendar({ version: 'v3', auth });
  console.log('Google Calendar API initialized');

  // Essayer d'abord de récupérer la liste des calendriers pour vérifier l'accès
  try {
    console.log('Checking calendar access...');
    const calendarList = await calendar.calendarList.list();
    console.log('Calendar list retrieved successfully');
    console.log('Number of calendars:', calendarList.data.items.length);

    // Trouver le calendrier primaire
    const primaryCalendar = calendarList.data.items.find(cal => cal.primary);
    if (primaryCalendar) {
      console.log('Primary calendar found:', primaryCalendar.id);
    } else {
      console.warn('No primary calendar found, using "primary" as calendar ID');
    }
  } catch (calendarListError) {
    console.error('Error retrieving calendar list:', calendarListError);
    if (calendarListError.message) {
      console.error('Error message:', calendarListError.message);
    }
  }

  try {
    console.log('Sending request to Google Calendar API...');
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      sendUpdates: 'all', // Envoyer des notifications à tous les participants
      supportsAttachments: true,
      conferenceDataVersion: 1 // Support pour les conférences
    });

    console.log('Response received from Google Calendar API');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    console.log('=== FIN CRÉATION ÉVÉNEMENT GOOGLE CALENDAR ===');

    return response.data;
  } catch (error) {
    console.error('=== ERREUR CRÉATION ÉVÉNEMENT GOOGLE CALENDAR ===');
    console.error('Error creating calendar event:', error);

    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
    }

    if (error.message) {
      console.error('Error message:', error.message);
    }

    // Essayer une approche alternative si l'erreur est liée à l'authentification
    if (error.message && (
        error.message.includes('invalid_grant') ||
        error.message.includes('Invalid Credentials') ||
        error.message.includes('Token has been expired or revoked')
    )) {
      console.log('Authentication error detected, trying alternative approach...');

      try {
        // Essayer de créer un événement avec des options minimales
        const simpleEvent = {
          summary: event.summary,
          description: event.description,
          start: event.start,
          end: event.end
        };

        console.log('Sending simplified request to Google Calendar API...');
        const simpleResponse = await calendar.events.insert({
          calendarId: 'primary',
          resource: simpleEvent
        });

        console.log('Simplified response received from Google Calendar API');
        console.log('Response status:', simpleResponse.status);
        console.log('Response data:', JSON.stringify(simpleResponse.data, null, 2));
        console.log('=== FIN CRÉATION ÉVÉNEMENT GOOGLE CALENDAR (ALTERNATIVE) ===');

        return simpleResponse.data;
      } catch (alternativeError) {
        console.error('Alternative approach also failed:', alternativeError);
      }
    }

    console.error('=== FIN ERREUR CRÉATION ÉVÉNEMENT GOOGLE CALENDAR ===');
    throw error;
  }
};

// Update calendar event
const updateCalendarEvent = async (auth, eventId, event) => {
  const calendar = google.calendar({ version: 'v3', auth });
  try {
    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId: eventId,
      resource: event,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating calendar event:', error);
    throw error;
  }
};

// Delete calendar event
const deleteCalendarEvent = async (auth, eventId) => {
  const calendar = google.calendar({ version: 'v3', auth });
  try {
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
    });
    return true;
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    throw error;
  }
};

module.exports = {
  createOAuth2Client,
  getAuthUrl,
  getTokens,
  setCredentials,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent
};
