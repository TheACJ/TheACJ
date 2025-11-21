
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Import database connection
const connectDB = require('./config/database');

// Import routes
const blogRoutes = require('./routes/blog');
const workRoutes = require('./routes/work');
const categoryRoutes = require('./routes/category');
const contactRoutes = require('./routes/contact');

// Import admin routes
const adminAuthRoutes = require('./routes/adminAuth');
const adminDashboardRoutes = require('./routes/adminDashboard');
const adminContentRoutes = require('./routes/adminContent');
const uploadRoutes = require('./routes/upload');
const contentRoutes = require('./routes/content');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Connect to database
connectDB();

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://code.jquery.com"],
      "style-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      "font-src": ["'self'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
      "img-src": ["'self'", "data:", "https:", "blob:"],
      "connect-src": ["'self'"],
      "media-src": ["'self'"],
      "object-src": ["'none'"],
      "base-uri": ["'self'"],
      "form-action": ["'self'"],
      "frame-ancestors": ["'none'"],
      "upgrade-insecure-requests": null
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/admin/assets', express.static(path.join(__dirname, 'views/assets')));
app.use('/assets', express.static(path.join(__dirname, 'views/assets')));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Admin interface routes
app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/admin/login.html'));
});

app.get('/admin/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/admin/dashboard.html'));
});

app.get('/admin/blog-posts', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/admin/blog-posts.html'));
});

app.get('/admin/work-items', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/admin/work-items.html'));
});

app.get('/admin/contacts', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/admin/contacts.html'));
});

app.get('/admin/categories', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/admin/categories.html'));
});

app.get('/admin/content', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/admin/content.html'));
});

app.get('/admin/users', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/admin/users.html'));
});

app.get('/admin/settings', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/admin/settings.html'));
});

// API routes
app.use('/api/blog-posts', blogRoutes);
app.use('/api/works', workRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/content', contentRoutes);

// Admin API routes
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/admin/content', adminContentRoutes);
app.use('/api/admin/upload', uploadRoutes);
app.use('/api/admin/content/sections', contentRoutes);

// For compatibility with existing frontend
app.use('/api/blog-posts/', blogRoutes);
app.use('/api/works/', workRoutes);
app.use('/api/categories/', categoryRoutes);
app.use('/api/contact/', contactRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`Admin interface available at: http://localhost:${PORT}/admin/login`);
  
  // Initialize default admin user
  try {
    const AdminUser = require('./models/AdminUser');
    await AdminUser.createDefaultAdmin();
  } catch (error) {
    console.error('Failed to create default admin:', error.message);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`);
  console.log('Shutting down the server due to Uncaught Exception');
  process.exit(1);
});

module.exports = app;