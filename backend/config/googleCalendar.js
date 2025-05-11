const { google } = require('googleapis');
require('dotenv').config();

// Configuration for Google Calendar API
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
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
  const options = {
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent' // Force to get refresh token
  };

  // Add state parameter if provided
  if (state) {
    options.state = state;
  }

  return oauth2Client.generateAuthUrl(options);
};

// Get tokens from code
const getTokens = async (code) => {
  const oauth2Client = createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

// Set credentials to OAuth2 client
const setCredentials = (tokens) => {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials(tokens);
  return oauth2Client;
};

// Create calendar event
const createCalendarEvent = async (auth, event) => {
  const calendar = google.calendar({ version: 'v3', auth });
  try {
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating calendar event:', error);
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
