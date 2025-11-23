const mongoose = require('mongoose');

const pageViewSchema = new mongoose.Schema({
  page: {
    type: String,
    required: true,
    index: true
  },
  referrer: {
    type: String,
    index: true
  },
  userAgent: {
    type: String,
    required: true
  },
  screenResolution: {
    type: String,
    required: true
  },
  timezone: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  ipAddress: {
    type: String,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const clickSchema = new mongoose.Schema({
  element: {
    type: String,
    required: true
  },
  page: {
    type: String,
    required: true,
    index: true
  },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  ipAddress: {
    type: String,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  startTime: {
    type: Date,
    required: true,
    index: true
  },
  endTime: {
    type: Date,
    index: true
  },
  duration: {
    type: Number, // in milliseconds
    index: true
  },
  pages: [{
    type: String
  }],
  deviceType: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet'],
    required: true,
    index: true
  },
  browser: {
    type: String,
    required: true,
    index: true
  },
  os: {
    type: String,
    required: true,
    index: true
  },
  ipAddress: {
    type: String,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const eventSchema = new mongoose.Schema({
  event: {
    type: String,
    required: true,
    index: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed
  },
  page: {
    type: String,
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  ipAddress: {
    type: String,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const conversionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    index: true
  },
  value: {
    type: Number
  },
  page: {
    type: String,
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  ipAddress: {
    type: String,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const scrollDepthSchema = new mongoose.Schema({
  depth: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  page: {
    type: String,
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  ipAddress: {
    type: String,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for better query performance
pageViewSchema.index({ timestamp: -1, page: 1 });
pageViewSchema.index({ sessionId: 1, timestamp: -1 });
clickSchema.index({ timestamp: -1, page: 1 });
clickSchema.index({ sessionId: 1, timestamp: -1 });
sessionSchema.index({ startTime: -1, isActive: 1 });
eventSchema.index({ timestamp: -1, event: 1 });
conversionSchema.index({ timestamp: -1, type: 1 });
scrollDepthSchema.index({ timestamp: -1, page: 1 });

// Create models
const PageView = mongoose.model('PageView', pageViewSchema);
const Click = mongoose.model('Click', clickSchema);
const Session = mongoose.model('Session', sessionSchema);
const Event = mongoose.model('Event', eventSchema);
const Conversion = mongoose.model('Conversion', conversionSchema);
const ScrollDepth = mongoose.model('ScrollDepth', scrollDepthSchema);

module.exports = {
  PageView,
  Click,
  Session,
  Event,
  Conversion,
  ScrollDepth
};