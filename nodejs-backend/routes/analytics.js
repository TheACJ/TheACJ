const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// Public routes for tracking (no authentication required)
router.post('/pageview', analyticsController.trackPageView);
router.post('/click', analyticsController.trackClick);
router.post('/scroll', analyticsController.trackScrollDepth);
router.post('/session', analyticsController.trackSession);
router.post('/session-resume', analyticsController.trackSessionResume);
router.post('/event', analyticsController.trackEvent);
router.post('/conversion', analyticsController.trackConversion);

// Admin routes for analytics data (authentication required)
router.get('/summary', authenticateAdmin, analyticsController.getAnalyticsSummary);

module.exports = router;