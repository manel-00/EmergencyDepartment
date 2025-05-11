const User = require('../../models/User');
const googleCalendarConfig = require('../../config/googleCalendar');

// Generate authorization URL for Google Calendar
exports.getAuthUrl = async (req, res) => {
  try {
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

    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ message: 'Failed to generate authorization URL' });
  }
};

// Handle OAuth callback
exports.handleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

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
      return res.status(400).json({ message: 'Authorization code is missing' });
    }

    if (!userId) {
      console.error('User ID not found in state or session');
      return res.status(400).json({ message: 'User identification failed. Please try again.' });
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

    // Redirect to a simple success page
    res.redirect('/calendar-success.html');
  } catch (error) {
    console.error('Error handling OAuth callback:', error);
    res.status(500).json({ message: 'Failed to complete authorization', error: error.message });
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

// Add appointment to Google Calendar
exports.addAppointmentToCalendar = async (doctorId, appointment) => {
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
    const auth = googleCalendarConfig.setCredentials(doctor.googleCalendarTokens);

    // Format appointment date and time
    const appointmentDate = new Date(appointment.date);

    // Calculate end time (assuming 30 minutes for consultation)
    const endTime = new Date(appointmentDate);
    endTime.setMinutes(endTime.getMinutes() + (appointment.duree || 30));

    // Create event object
    const event = {
      summary: `Téléconsultation avec ${patient.name} ${patient.lastname}`,
      description: `Type: ${appointment.typeConsultation}\nNotes: ${appointment.notes || 'Aucune note'}`,
      start: {
        dateTime: appointmentDate.toISOString(),
        timeZone: 'Europe/Paris',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'Europe/Paris',
      },
      attendees: [
        { email: doctor.email },
        { email: patient.email }
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 }
        ]
      }
    };

    // Add event to calendar
    const calendarEvent = await googleCalendarConfig.createCalendarEvent(auth, event);

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
    const auth = googleCalendarConfig.setCredentials(doctor.googleCalendarTokens);

    // Format appointment date and time
    const appointmentDate = new Date(appointment.date);

    // Calculate end time (assuming 30 minutes for consultation)
    const endTime = new Date(appointmentDate);
    endTime.setMinutes(endTime.getMinutes() + (appointment.duree || 30));

    // Create event object
    const event = {
      summary: `Téléconsultation avec ${patient.name} ${patient.lastname}`,
      description: `Type: ${appointment.typeConsultation}\nNotes: ${appointment.notes || 'Aucune note'}`,
      start: {
        dateTime: appointmentDate.toISOString(),
        timeZone: 'Europe/Paris',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'Europe/Paris',
      },
      attendees: [
        { email: doctor.email },
        { email: patient.email }
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 }
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
    const auth = googleCalendarConfig.setCredentials(doctor.googleCalendarTokens);

    // Delete event from calendar
    await googleCalendarConfig.deleteCalendarEvent(auth, eventId);

    return true;
  } catch (error) {
    console.error('Error deleting appointment from Google Calendar:', error);
    return false;
  }
};
