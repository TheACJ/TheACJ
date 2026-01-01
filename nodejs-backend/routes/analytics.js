const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const { authenticateAdmin } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiter specifically for analytics tracking endpoints
const trackingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 300, // Allow 300 requests per minute per IP for tracking
  message: 'Too many tracking requests, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Public routes for tracking (no authentication required, but rate limited)
router.post('/pageview', trackingLimiter, analyticsController.trackPageView);
router.post('/click', trackingLimiter, analyticsController.trackClick);
router.post('/scroll', trackingLimiter, analyticsController.trackScrollDepth);
router.post('/session', trackingLimiter, analyticsController.trackSession);
router.post('/session-resume', trackingLimiter, analyticsController.trackSessionResume);
router.post('/event', trackingLimiter, analyticsController.trackEvent);
router.post('/conversion', trackingLimiter, analyticsController.trackConversion);

// Admin routes for analytics data (authentication required)
router.get('/summary', authenticateAdmin, analyticsController.getAnalyticsSummary);

module.exports = router;