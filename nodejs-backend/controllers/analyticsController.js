const { validationResult } = require('express-validator');
const {
  PageView,
  Click,
  Session,
  Event,
  Conversion,
  ScrollDepth
} = require('../models/Analytics');

// Helper function to get client IP address
const getClientIP = (req) => {
  // Check for forwarded headers (behind proxy)
  const forwarded = req.headers['x-forwarded-for'] || req.headers['x-real-ip'];
  if (forwarded) {
    // Take the first IP if multiple are present
    return forwarded.split(',')[0].trim();
  }

  // Fallback to connection remote address
  return req.connection.remoteAddress || req.socket.remoteAddress || req.ip || 'unknown';
};

// @desc    Track page view
// @route   POST /api/analytics/pageview
// @access  Public
const trackPageView = async (req, res) => {
  try {
    const {
      page,
      referrer,
      userAgent,
      screenResolution,
      timezone,
      language,
      sessionId,
      timestamp
    } = req.body;

    // Validate required fields
    if (!page || !userAgent || !screenResolution || !timezone || !language || !sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        code: 'MISSING_FIELDS'
      });
    }

    const ipAddress = getClientIP(req);

    // Create page view record
    const pageView = new PageView({
      page,
      referrer,
      userAgent,
      screenResolution,
      timezone,
      language,
      sessionId,
      ipAddress,
      timestamp: timestamp ? new Date(timestamp) : new Date()
    });

    await pageView.save();

    res.status(200).json({
      success: true,
      message: 'Page view tracked successfully'
    });
  } catch (error) {
    console.error('Track page view error:', error.message);

    res.status(500).json({
      success: false,
      error: 'Failed to track page view',
      code: 'PAGEVIEW_TRACK_ERROR'
    });
  }
};

// @desc    Track click event
// @route   POST /api/analytics/click
// @access  Public
const trackClick = async (req, res) => {
  try {
    const {
      element,
      page,
      position,
      sessionId,
      timestamp
    } = req.body;

    // Validate required fields
    if (!element || !page || !position || !sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        code: 'MISSING_FIELDS'
      });
    }

    const ipAddress = getClientIP(req);

    // Create click record
    const click = new Click({
      element,
      page,
      position,
      sessionId,
      ipAddress,
      timestamp: timestamp ? new Date(timestamp) : new Date()
    });

    await click.save();

    res.status(200).json({
      success: true,
      message: 'Click tracked successfully'
    });
  } catch (error) {
    console.error('Track click error:', error.message);

    res.status(500).json({
      success: false,
      error: 'Failed to track click',
      code: 'CLICK_TRACK_ERROR'
    });
  }
};

// @desc    Track scroll depth
// @route   POST /api/analytics/scroll
// @access  Public
const trackScrollDepth = async (req, res) => {
  try {
    const {
      depth,
      page,
      sessionId,
      timestamp
    } = req.body;

    // Validate required fields
    if (depth === undefined || !page || !sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        code: 'MISSING_FIELDS'
      });
    }

    const ipAddress = getClientIP(req);

    // Create scroll depth record
    const scrollDepth = new ScrollDepth({
      depth: Math.max(0, Math.min(100, depth)), // Ensure between 0-100
      page,
      sessionId,
      ipAddress,
      timestamp: timestamp ? new Date(timestamp) : new Date()
    });

    await scrollDepth.save();

    res.status(200).json({
      success: true,
      message: 'Scroll depth tracked successfully'
    });
  } catch (error) {
    console.error('Track scroll depth error:', error.message);

    res.status(500).json({
      success: false,
      error: 'Failed to track scroll depth',
      code: 'SCROLL_TRACK_ERROR'
    });
  }
};

// @desc    Track session data
// @route   POST /api/analytics/session
// @access  Public
const trackSession = async (req, res) => {
  try {
    const {
      sessionId,
      startTime,
      endTime,
      duration,
      pages,
      deviceType,
      browser,
      os
    } = req.body;

    // Validate required fields
    if (!sessionId || !startTime || !deviceType || !browser || !os) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        code: 'MISSING_FIELDS'
      });
    }

    const ipAddress = getClientIP(req);

    // Check if session already exists
    let session = await Session.findOne({ sessionId });

    if (session) {
      // Update existing session
      session.endTime = endTime ? new Date(endTime) : new Date();
      session.duration = duration || (session.endTime - session.startTime);
      session.pages = pages || session.pages;
      session.isActive = false;
      session.updatedAt = new Date();
    } else {
      // Create new session
      session = new Session({
        sessionId,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : undefined,
        duration,
        pages: pages || [],
        deviceType,
        browser,
        os,
        ipAddress,
        isActive: !endTime
      });
    }

    await session.save();

    res.status(200).json({
      success: true,
      message: 'Session tracked successfully'
    });
  } catch (error) {
    console.error('Track session error:', error.message);

    res.status(500).json({
      success: false,
      error: 'Failed to track session',
      code: 'SESSION_TRACK_ERROR'
    });
  }
};

// @desc    Track session resume
// @route   POST /api/analytics/session-resume
// @access  Public
const trackSessionResume = async (req, res) => {
  try {
    const { sessionId, timestamp } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing sessionId',
        code: 'MISSING_SESSION_ID'
      });
    }

    // Update session as active
    await Session.findOneAndUpdate(
      { sessionId },
      {
        isActive: true,
        updatedAt: new Date()
      }
    );

    res.status(200).json({
      success: true,
      message: 'Session resume tracked successfully'
    });
  } catch (error) {
    console.error('Track session resume error:', error.message);

    res.status(500).json({
      success: false,
      error: 'Failed to track session resume',
      code: 'SESSION_RESUME_TRACK_ERROR'
    });
  }
};

// @desc    Track custom event
// @route   POST /api/analytics/event
// @access  Public
const trackEvent = async (req, res) => {
  try {
    const {
      event,
      data,
      page,
      sessionId,
      timestamp
    } = req.body;

    // Validate required fields
    if (!event || !page || !sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        code: 'MISSING_FIELDS'
      });
    }

    const ipAddress = getClientIP(req);

    // Create event record
    const eventRecord = new Event({
      event,
      data,
      page,
      sessionId,
      ipAddress,
      timestamp: timestamp ? new Date(timestamp) : new Date()
    });

    await eventRecord.save();

    res.status(200).json({
      success: true,
      message: 'Event tracked successfully'
    });
  } catch (error) {
    console.error('Track event error:', error.message);

    res.status(500).json({
      success: false,
      error: 'Failed to track event',
      code: 'EVENT_TRACK_ERROR'
    });
  }
};

// @desc    Track conversion
// @route   POST /api/analytics/conversion
// @access  Public
const trackConversion = async (req, res) => {
  try {
    const {
      type,
      value,
      page,
      sessionId,
      timestamp
    } = req.body;

    // Validate required fields
    if (!type || !page || !sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        code: 'MISSING_FIELDS'
      });
    }

    const ipAddress = getClientIP(req);

    // Create conversion record
    const conversion = new Conversion({
      type,
      value,
      page,
      sessionId,
      ipAddress,
      timestamp: timestamp ? new Date(timestamp) : new Date()
    });

    await conversion.save();

    res.status(200).json({
      success: true,
      message: 'Conversion tracked successfully'
    });
  } catch (error) {
    console.error('Track conversion error:', error.message);

    res.status(500).json({
      success: false,
      error: 'Failed to track conversion',
      code: 'CONVERSION_TRACK_ERROR'
    });
  }
};

// @desc    Get analytics summary
// @route   GET /api/admin/analytics/summary
// @access  Private (Admin)
const getAnalyticsSummary = async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get various metrics
    const [
      totalPageViews,
      uniqueSessions,
      totalClicks,
      totalEvents,
      avgSessionDuration,
      topPages,
      deviceBreakdown,
      referrerStats
    ] = await Promise.all([
      // Total page views
      PageView.countDocuments({ timestamp: { $gte: startDate } }),

      // Unique sessions
      Session.countDocuments({
        startTime: { $gte: startDate },
        isActive: false
      }),

      // Total clicks
      Click.countDocuments({ timestamp: { $gte: startDate } }),

      // Total events
      Event.countDocuments({ timestamp: { $gte: startDate } }),

      // Average session duration
      Session.aggregate([
        { $match: { startTime: { $gte: startDate }, duration: { $exists: true } } },
        { $group: { _id: null, avgDuration: { $avg: '$duration' } } }
      ]),

      // Top pages
      PageView.aggregate([
        { $match: { timestamp: { $gte: startDate } } },
        { $group: { _id: '$page', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),

      // Device breakdown
      Session.aggregate([
        { $match: { startTime: { $gte: startDate } } },
        { $group: { _id: '$deviceType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),

      // Referrer stats
      PageView.aggregate([
        { $match: { timestamp: { $gte: startDate }, referrer: { $ne: null, $ne: '' } } },
        { $group: { _id: '$referrer', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    const summary = {
      period,
      overview: {
        pageViews: totalPageViews,
        uniqueSessions,
        clicks: totalClicks,
        events: totalEvents,
        avgSessionDuration: avgSessionDuration[0]?.avgDuration || 0
      },
      topPages,
      deviceBreakdown,
      referrerStats
    };

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Get analytics summary error:', error.message);

    res.status(500).json({
      success: false,
      error: 'Failed to get analytics summary',
      code: 'ANALYTICS_SUMMARY_ERROR'
    });
  }
};

module.exports = {
  trackPageView,
  trackClick,
  trackScrollDepth,
  trackSession,
  trackSessionResume,
  trackEvent,
  trackConversion,
  getAnalyticsSummary
};