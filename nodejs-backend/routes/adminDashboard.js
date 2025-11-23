const express = require('express');
const { body } = require('express-validator');
const adminDashboardController = require('../controllers/adminDashboardController');
const { authenticateAdmin, requireSuperAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createUserValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters'),
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'super_admin'])
    .withMessage('Role must be either admin or super_admin')
];

const updateUserValidation = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'super_admin'])
    .withMessage('Role must be either admin or super_admin'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value')
];

const settingsValidation = [
  body('settings')
    .isObject()
    .withMessage('Settings must be an object')
];

// Apply authentication to all routes
router.use(authenticateAdmin);

// Dashboard stats (accessible to all authenticated admins)
router.get('/stats', adminDashboardController.getDashboardStats);

// User management (super admin only)
router.get('/users', requireSuperAdmin, adminDashboardController.getUsers);
router.post('/users', requireSuperAdmin, createUserValidation, adminDashboardController.createUser);
router.put('/users/:id', requireSuperAdmin, updateUserValidation, adminDashboardController.updateUser);
router.delete('/users/:id', requireSuperAdmin, adminDashboardController.deleteUser);

// Activity logs (super admin only)
router.get('/activity-logs', requireSuperAdmin, adminDashboardController.getActivityLogs);

// Activity feed (accessible to all authenticated admins)
router.get('/activity', authenticateAdmin, adminDashboardController.getActivityLogs);

// Notifications (placeholder - accessible to all authenticated admins)
router.get('/notifications', authenticateAdmin, (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      notifications: [],
      unreadCount: 0
    }
  });
});

// Settings (super admin only)
router.get('/settings', requireSuperAdmin, adminDashboardController.getSettings);
router.put('/settings', requireSuperAdmin, settingsValidation, adminDashboardController.updateSettings);

// Health check for admin dashboard
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin dashboard is running',
    timestamp: new Date().toISOString(),
    admin: {
      id: req.admin._id,
      username: req.admin.username,
      role: req.admin.role
    }
  });
});

module.exports = router;