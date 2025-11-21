const express = require('express');
const { body } = require('express-validator');
const adminAuthController = require('../controllers/adminAuthController');
const { authenticateAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const loginValidation = [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('rememberMe')
    .optional()
    .isBoolean()
    .withMessage('Remember me must be a boolean value')
];

const updateProfileValidation = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('currentPassword')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Current password must be at least 6 characters long'),
  body('newPassword')
    .optional()
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

const forgotPasswordValidation = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email')
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const refreshTokenValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
];

// Routes

// Public routes (no authentication required)
router.post('/login', loginValidation, adminAuthController.login);

router.post('/forgot-password', forgotPasswordValidation, adminAuthController.forgotPassword);

router.post('/reset-password', resetPasswordValidation, adminAuthController.resetPassword);

router.post('/refresh', refreshTokenValidation, adminAuthController.refreshToken);

// Protected routes (authentication required)
router.post('/logout', authenticateAdmin, adminAuthController.logout);

router.get('/me', authenticateAdmin, adminAuthController.getProfile);

router.get('/verify', authenticateAdmin, adminAuthController.verifyToken);

router.put('/profile', authenticateAdmin, updateProfileValidation, adminAuthController.updateProfile);

router.post('/change-password', authenticateAdmin, changePasswordValidation, adminAuthController.changePassword);

// Health check for admin system
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin authentication system is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

module.exports = router;