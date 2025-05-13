const User = require('../../models/User');
const googleCalendarConfig = require('../../config/googleCalendar');

// Generate authorization URL for Google Calendar
exports.getAuthUrl = async (req, res) => {
  try {
    // Check if the request comes from a browser (direct GET) or an API (AJAX)
    const isDirectAccess = req.headers.accept && req.headers.accept.includes('text/html');

    // If it's a direct access from the browser, redirect to the instructions page
    if (isDirectAccess && !req.headers['x-requested-with']) {
      console.log('Direct browser access detected, redirecting to instructions page');
      return res.redirect('/calendar-instructions.html');
    }

    const userId = req.user.userId;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate auth URL with state parameter containing userId
    // This allows us to identify the user without relying on sessions
    const state = Buffer.from(JSON.stringify({ userId })).toString('base64');
    const authUrl = googleCalendarConfig.getAuthUrl(state);

    // Also store in session as backup
    req.session.calendarAuthUserId = userId;
    console.log('User ID stored in session:', userId);

    // If it's an API request, return the URL as JSON
    if (!isDirectAccess || req.headers['x-requested-with']) {
      return res.json({ authUrl });
    }

    // Otherwise, redirect directly to the Google authentication URL
    res.redirect(authUrl);
  } catch (error) {
    console.error('Error generating auth URL:', error);

    // Handle differently based on request type
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(500).json({ message: 'Failed to generate authorization URL' });
    }

    // Redirect to error page for browser requests
    res.redirect('/calendar-error.html?message=Error+generating+authorization+URL&code=AUTH_URL_ERROR');
  }
};

// Handle OAuth callback
exports.handleCallback = async (req, res) => {
  try {
    // Log all request parameters for debugging
    console.log('=== START GOOGLE CALENDAR CALLBACK ===');
    console.log('Callback URL:', req.originalUrl);
    console.log('Query parameters:', req.query);
    console.log('Headers:', req.headers);

    const { code, state, error, error_description } = req.query;

    // Check if there's an explicit error from Google
    if (error) {
      console.error(`Google OAuth error: ${error} - ${error_description || 'No description'}`);

      // Specific handling for access_denied error
      if (error === 'access_denied') {
        console.log('User denied access to the application');
        return res.redirect('/calendar-error.html?message=You+denied+access+to+the+application.+Please+try+again+and+accept+the+requested+permissions.&code=access_denied');
      }

      return res.redirect(`/calendar-error.html?message=${encodeURIComponent(error_description || error)}&code=${error}`);
    }

    console.log('Callback received with code:', code ? 'Code present' : 'No code');
    console.log('Callback received with state:', state ? 'State present' : 'No state');

    let userId;

    // Try to get userId from state parameter first
    if (state) {
      try {
        const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
        userId = stateData.userId;
        console.log('User ID extracted from state parameter:', userId);
      } catch (err) {
        console.error('Error parsing state parameter:', err);
      }
    }

    // If userId not found in state, try session as fallback
    if (!userId) {
      userId = req.session.calendarAuthUserId;
      console.log('User ID from session:', userId);
    }

    if (!code) {
      console.error('Authorization code is missing in the callback');

      // Générer une nouvelle URL d'authentification et rediriger l'utilisateur
      let newUserId = userId;

      // Si nous n'avons pas d'userId, utiliser un ID par défaut pour les tests
      if (!newUserId) {
        console.warn('No user ID found, using default user ID for testing');
        // Essayer de trouver un utilisateur médecin pour les tests
        try {
          const User = require('../../models/User');
          const testDoctor = await User.findOne({ role: 'doctor' });
          if (testDoctor) {
            newUserId = testDoctor._id;
            console.log('Found test doctor ID:', newUserId);
          }
        } catch (err) {
          console.error('Error finding test doctor:', err);
        }
      }

      if (newUserId) {
        const newState = Buffer.from(JSON.stringify({ userId: newUserId })).toString('base64');
        const newAuthUrl = require('../../config/googleCalendar').getAuthUrl(newState);
        console.log('Redirecting to new auth URL:', newAuthUrl);
        return res.redirect(newAuthUrl);
      } else {
        // Si nous ne pouvons pas générer une nouvelle URL, rediriger vers la page d'erreur
        return res.redirect('/calendar-error.html?message=Code+d%27autorisation+manquant&code=NO_AUTH_CODE');
      }
    }

    if (!userId) {
      console.error('User ID not found in state or session');
      // Rediriger vers la page d'erreur
      return res.redirect('/calendar-error.html?message=Identification+utilisateur+échouée&code=NO_USER_ID');
    }

    console.log('Processing callback for user ID:', userId);

    // Get tokens from code
    const tokens = await googleCalendarConfig.getTokens(code);

    // Update user with tokens
    await User.findByIdAndUpdate(userId, {
      googleCalendarEnabled: true,
      googleCalendarTokens: tokens
    });

    // Clear the session variable if it exists
    if (req.session.calendarAuthUserId) {
      delete req.session.calendarAuthUserId;
    }

    // Redirect to the success page
    res.redirect('/calendar-success.html');
  } catch (error) {
    console.error('Error handling OAuth callback:', error);
    // Rediriger vers la page d'erreur
    return res.redirect(`/calendar-error.html?message=${encodeURIComponent('Erreur lors de l\'autorisation: ' + error.message)}&code=AUTH_ERROR`);
  }
};

// Toggle Google Calendar integration
exports.toggleCalendarIntegration = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { enabled } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If disabling, just update the flag
    if (enabled === false) {
      user.googleCalendarEnabled = false;
      await user.save();
      return res.json({ message: 'Google Calendar integration disabled', enabled: false });
    }

    // If enabling but no tokens, return error
    if (enabled === true && (!user.googleCalendarTokens || !user.googleCalendarTokens.access_token)) {
      return res.status(400).json({
        message: 'Cannot enable Google Calendar integration without authorization',
        needsAuth: true
      });
    }

    // Enable integration
    user.googleCalendarEnabled = true;
    await user.save();

    res.json({ message: 'Google Calendar integration enabled', enabled: true });
  } catch (error) {
    console.error('Error toggling calendar integration:', error);
    res.status(500).json({ message: 'Failed to update calendar integration settings' });
  }
};

// Get integration status
exports.getIntegrationStatus = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      enabled: user.googleCalendarEnabled,
      connected: !!(user.googleCalendarTokens && user.googleCalendarTokens.access_token)
    });
  } catch (error) {
    console.error('Error getting integration status:', error);
    res.status(500).json({ message: 'Failed to get integration status' });
  }
};

// Update user's Google Calendar tokens
const updateUserTokens = async (userId, newTokens) => {
  try {
    console.log('Mise à jour des tokens Google Calendar pour l\'utilisateur:', userId);

    // Fusionner les nouveaux tokens avec les tokens existants
    const user = await User.findById(userId);
    if (!user) {
      console.error('Utilisateur non trouvé pour la mise à jour des tokens');
      return false;
    }

    const updatedTokens = {
      ...user.googleCalendarTokens,
      ...newTokens
    };

    // Mettre à jour l'utilisateur
    await User.findByIdAndUpdate(userId, {
      googleCalendarTokens: updatedTokens
    });

    console.log('Tokens mis à jour avec succès');
    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour des tokens:', error);
    return false;
  }
};

// Add appointment to Google Calendar
exports.addAppointmentToCalendar = async (doctorId, appointment) => {
  try {
    console.log('=== DÉBUT AJOUT RENDEZ-VOUS AU CALENDRIER GOOGLE ===');
    console.log('doctorId:', doctorId);
    console.log('appointment:', JSON.stringify(appointment, null, 2));

    // Find the doctor
    const doctor = await User.findById(doctorId);
    console.log('Doctor found:', doctor ? 'Oui' : 'Non');

    if (doctor) {
      console.log('Doctor email:', doctor.email);
      console.log('Google Calendar enabled:', doctor.googleCalendarEnabled);
      console.log('Google Calendar tokens exist:', !!doctor.googleCalendarTokens);

      if (doctor.googleCalendarTokens) {
        console.log('Access token exists:', !!doctor.googleCalendarTokens.access_token);
        console.log('Refresh token exists:', !!doctor.googleCalendarTokens.refresh_token);
        console.log('Token expiry:', doctor.googleCalendarTokens.expiry_date);

        // Vérifier si le token est expiré
        const now = Date.now();
        if (doctor.googleCalendarTokens.expiry_date) {
          console.log('Token expiré?', doctor.googleCalendarTokens.expiry_date < now);
        }
      }
    }

    // Check if doctor has Google Calendar integration enabled
    if (!doctor || !doctor.googleCalendarEnabled || !doctor.googleCalendarTokens) {
      console.log('Doctor does not have Google Calendar integration enabled');
      return null;
    }

    // Find patient details
    const patient = await User.findById(appointment.patient);
    if (!patient) {
      console.log('Patient not found');
      return null;
    }
    console.log('Patient found:', patient.name, patient.lastname, patient.email);

    // Set up OAuth2 client with doctor's tokens
    console.log('Setting up OAuth2 client with doctor tokens...');
    const auth = googleCalendarConfig.setCredentials(doctor.googleCalendarTokens, doctorId);
    console.log('OAuth2 client setup complete');

    // Format appointment date and time
    const appointmentDate = new Date(appointment.date);
    console.log('Appointment date:', appointmentDate);

    // Calculate end time (assuming 30 minutes for consultation)
    const endTime = new Date(appointmentDate);
    endTime.setMinutes(endTime.getMinutes() + (appointment.duree || 30));
    console.log('End time:', endTime);

    // Create event object with more details
    const event = {
      summary: `Téléconsultation avec ${patient.name} ${patient.lastname}`,
      description: `Type: ${appointment.typeConsultation}\nNotes: ${appointment.notes || 'Aucune note'}\n\nCe rendez-vous a été créé automatiquement par le système de téléconsultation.`,
      start: {
        dateTime: appointmentDate.toISOString(),
        timeZone: 'Europe/Paris',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'Europe/Paris',
      },
      location: 'Téléconsultation en ligne',
      colorId: '1', // Bleu
      transparency: 'opaque', // Show as busy
      visibility: 'default', // Default visibility
      status: 'confirmed', // Status confirmed
      attendees: [
        { email: doctor.email, responseStatus: 'accepted' },
        { email: patient.email, responseStatus: 'accepted' }
      ],
      // Ajouter des notifications pour s'assurer que le médecin est notifié
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 24 heures avant
          { method: 'popup', minutes: 60 }, // 1 heure avant
          { method: 'popup', minutes: 30 }, // 30 minutes avant
          { method: 'popup', minutes: 10 } // 10 minutes avant
        ]
      }
    };
    console.log('Event object created:', JSON.stringify(event, null, 2));

    // Add event to calendar
    console.log('Calling Google Calendar API to create event...');
    const calendarEvent = await googleCalendarConfig.createCalendarEvent(auth, event);
    console.log('Calendar event created:', calendarEvent ? 'Oui' : 'Non');
    if (calendarEvent) {
      console.log('Calendar event ID:', calendarEvent.id);
      console.log('Calendar event HTML link:', calendarEvent.htmlLink);
    }

    console.log('=== FIN AJOUT RENDEZ-VOUS AU CALENDRIER GOOGLE ===');
    return calendarEvent;
  } catch (error) {
    console.error('Error adding appointment to Google Calendar:', error);
    return null;
  }
};

// Update appointment in Google Calendar
exports.updateAppointmentInCalendar = async (doctorId, appointment, eventId) => {
  try {
    // Find the doctor
    const doctor = await User.findById(doctorId);

    // Check if doctor has Google Calendar integration enabled
    if (!doctor || !doctor.googleCalendarEnabled || !doctor.googleCalendarTokens) {
      console.log('Doctor does not have Google Calendar integration enabled');
      return null;
    }

    // Find patient details
    const patient = await User.findById(appointment.patient);
    if (!patient) {
      console.log('Patient not found');
      return null;
    }

    // Set up OAuth2 client with doctor's tokens
    const auth = googleCalendarConfig.setCredentials(doctor.googleCalendarTokens, doctorId);

    // Format appointment date and time
    const appointmentDate = new Date(appointment.date);

    // Calculate end time (assuming 30 minutes for consultation)
    const endTime = new Date(appointmentDate);
    endTime.setMinutes(endTime.getMinutes() + (appointment.duree || 30));

    // Create event object with more details
    const event = {
      summary: `Téléconsultation avec ${patient.name} ${patient.lastname}`,
      description: `Type: ${appointment.typeConsultation}\nNotes: ${appointment.notes || 'Aucune note'}\n\nCe rendez-vous a été créé automatiquement par le système de téléconsultation.`,
      start: {
        dateTime: appointmentDate.toISOString(),
        timeZone: 'Europe/Paris',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'Europe/Paris',
      },
      location: 'Téléconsultation en ligne',
      colorId: '1', // Bleu
      transparency: 'opaque', // Show as busy
      visibility: 'default', // Default visibility
      status: 'confirmed', // Status confirmed
      attendees: [
        { email: doctor.email, responseStatus: 'accepted' },
        { email: patient.email, responseStatus: 'accepted' }
      ],
      // Ajouter des notifications pour s'assurer que le médecin est notifié
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 24 heures avant
          { method: 'popup', minutes: 60 }, // 1 heure avant
          { method: 'popup', minutes: 30 }, // 30 minutes avant
          { method: 'popup', minutes: 10 } // 10 minutes avant
        ]
      }
    };

    // Update event in calendar
    const calendarEvent = await googleCalendarConfig.updateCalendarEvent(auth, eventId, event);

    return calendarEvent;
  } catch (error) {
    console.error('Error updating appointment in Google Calendar:', error);
    return null;
  }
};

// Test Google Calendar integration
exports.testCalendarIntegration = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has Google Calendar integration enabled
    if (!user.googleCalendarEnabled || !user.googleCalendarTokens) {
      return res.status(400).json({
        message: 'Google Calendar integration is not enabled for this user',
        enabled: false,
        connected: false
      });
    }

    // Set up OAuth2 client with user's tokens
    const auth = googleCalendarConfig.setCredentials(user.googleCalendarTokens, userId);

    // Create a test event
    const now = new Date();
    const thirtyMinutesLater = new Date(now.getTime() + 30 * 60000);

    const testEvent = {
      summary: 'Test d\'intégration Google Calendar',
      description: 'Cet événement a été créé pour tester l\'intégration avec Google Calendar. Vous pouvez le supprimer.',
      start: {
        dateTime: now.toISOString(),
        timeZone: 'Europe/Paris',
      },
      end: {
        dateTime: thirtyMinutesLater.toISOString(),
        timeZone: 'Europe/Paris',
      },
      colorId: '2', // Vert
      transparency: 'transparent', // Show as free
      visibility: 'private', // Private visibility
      status: 'confirmed', // Status confirmed
      attendees: [
        { email: user.email, responseStatus: 'accepted' }
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 5 }
        ]
      }
    };

    // Add event to calendar
    console.log('=== DÉBUT TEST INTÉGRATION GOOGLE CALENDAR ===');
    console.log('Calling Google Calendar API to create test event...');

    try {
      const calendarEvent = await googleCalendarConfig.createCalendarEvent(auth, testEvent);

      if (calendarEvent && calendarEvent.id) {
        console.log('Test event created successfully with ID:', calendarEvent.id);
        console.log('Test event HTML link:', calendarEvent.htmlLink);

        // Delete the test event immediately
        try {
          await googleCalendarConfig.deleteCalendarEvent(auth, calendarEvent.id);
          console.log('Test event deleted successfully');
        } catch (deleteError) {
          console.error('Error deleting test event:', deleteError);
          // Continue even if deletion fails
        }

        return res.json({
          message: 'Google Calendar integration test successful',
          success: true,
          eventCreated: true,
          eventId: calendarEvent.id,
          eventLink: calendarEvent.htmlLink
        });
      } else {
        console.error('Failed to create test event - no event ID returned');
        return res.status(500).json({
          message: 'Failed to create test event in Google Calendar',
          success: false,
          error: 'No event ID returned'
        });
      }
    } catch (createError) {
      console.error('Error creating test event:', createError);

      // Check if the error is related to authentication
      if (createError.message && (
          createError.message.includes('invalid_grant') ||
          createError.message.includes('Invalid Credentials') ||
          createError.message.includes('Token has been expired or revoked')
      )) {
        // Reset tokens and suggest reauthorization
        user.googleCalendarTokens = null;
        user.googleCalendarEnabled = false;
        await user.save();

        // Generate new auth URL
        const state = Buffer.from(JSON.stringify({ userId })).toString('base64');
        const authUrl = googleCalendarConfig.getAuthUrl(state);

        return res.status(401).json({
          message: 'Google Calendar authentication has expired. Please reauthorize.',
          success: false,
          needsReauthorization: true,
          authUrl
        });
      }

      return res.status(500).json({
        message: 'Error creating test event in Google Calendar',
        success: false,
        error: createError.message
      });
    }
  } catch (error) {
    console.error('Error testing Google Calendar integration:', error);
    return res.status(500).json({
      message: 'Failed to test Google Calendar integration',
      success: false,
      error: error.message
    });
  }
};

// Force reauthorization for Google Calendar
exports.forceReauthorization = async (req, res) => {
  try {
    const userId = req.user.userId || req.user._id;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Reset Google Calendar tokens
    user.googleCalendarTokens = null;
    user.googleCalendarEnabled = false;
    await user.save();

    // Generate new auth URL
    const state = Buffer.from(JSON.stringify({ userId })).toString('base64');
    const authUrl = googleCalendarConfig.getAuthUrl(state);

    res.json({
      message: 'Google Calendar integration reset. Please reauthorize.',
      authUrl
    });
  } catch (error) {
    console.error('Error forcing reauthorization:', error);
    res.status(500).json({ message: 'Failed to reset Google Calendar integration' });
  }
};

// Delete appointment from Google Calendar
exports.deleteAppointmentFromCalendar = async (doctorId, eventId) => {
  try {
    // Find the doctor
    const doctor = await User.findById(doctorId);

    // Check if doctor has Google Calendar integration enabled
    if (!doctor || !doctor.googleCalendarEnabled || !doctor.googleCalendarTokens) {
      console.log('Doctor does not have Google Calendar integration enabled');
      return false;
    }

    // Set up OAuth2 client with doctor's tokens
    const auth = googleCalendarConfig.setCredentials(doctor.googleCalendarTokens, doctorId);

    // Delete event from calendar
    await googleCalendarConfig.deleteCalendarEvent(auth, eventId);

    return true;
  } catch (error) {
    console.error('Error deleting appointment from Google Calendar:', error);
    return false;
  }
};
