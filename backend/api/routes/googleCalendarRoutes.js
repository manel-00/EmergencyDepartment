const express = require('express');
const router = express.Router();
const googleCalendarController = require('../controllers/googleCalendarController');
const auth = require('../middleware/auth');

// Get authorization URL for Google Calendar - requires authentication
router.get('/auth-url', auth, googleCalendarController.getAuthUrl);

// Handle OAuth callback - no authentication required
router.get('/callback', googleCalendarController.handleCallback);

// Toggle Google Calendar integration - requires authentication
router.post('/toggle', auth, googleCalendarController.toggleCalendarIntegration);

// Get integration status - requires authentication
router.get('/status', auth, googleCalendarController.getIntegrationStatus);

// Force reauthorization - requires authentication
router.post('/reauthorize', auth, googleCalendarController.forceReauthorization);

// Test Google Calendar integration - requires authentication
router.get('/test', auth, googleCalendarController.testCalendarIntegration);

module.exports = router;
