const AdminUser = require('../models/AdminUser');
const { 
  generateToken, 
  generateRefreshToken, 
  verifyPasswordResetToken,
  generatePasswordResetToken,
  generateEmailVerificationToken,
  verifyPasswordResetToken: verifyResetToken
} = require('../utils/jwt');
const { validationResult } = require('express-validator');
const crypto = require('crypto');

// @desc    Admin login
// @route   POST /api/admin/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { username, password, rememberMe } = req.body;

    // Find and authenticate admin
    const admin = await AdminUser.getAuthenticated(username, password);
    
    // Generate tokens
    const token = generateToken(admin);
    const refreshToken = generateRefreshToken(admin);

    // Prepare response data
    const responseData = {
      success: true,
      message: 'Login successful',
      data: {
        admin: admin.toJSON(),
        token: token,
        refreshToken: refreshToken,
        expiresIn: process.env.JWT_EXPIRE || '24h'
      }
    };

    // Set secure cookies if rememberMe is true
    if (rememberMe) {
      res.cookie('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 * 7 // 7 days
      });

      res.cookie('admin_refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 * 30 // 30 days
      });
    }

    // Log successful login
    console.log(`Admin login successful: ${admin.username} (${admin.email})`);

    res.status(200).json(responseData);
  } catch (error) {
    console.error('Admin login error:', error.message);
    
    // Don't reveal specific error details for security
    res.status(401).json({
      success: false,
      error: 'Invalid credentials',
      code: 'LOGIN_FAILED'
    });
  }
};

// @desc    Admin logout
// @route   POST /api/admin/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // Clear cookies
    res.clearCookie('admin_token');
    res.clearCookie('admin_refresh_token');

    // Log successful logout
    if (req.admin) {
      console.log(`Admin logout successful: ${req.admin.username} (${req.admin.email})`);
    }

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Admin logout error:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Logout failed',
      code: 'LOGOUT_ERROR'
    });
  }
};

// @desc    Refresh admin token
// @route   POST /api/admin/auth/refresh
// @access  Public
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token is required',
        code: 'NO_REFRESH_TOKEN'
      });
    }

    // Verify refresh token
    const decoded = require('../utils/jwt').verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token type',
        code: 'INVALID_TOKEN_TYPE'
      });
    }

    // Find admin user
    const admin = await AdminUser.findById(decoded.id);
    
    if (!admin || !admin.isActive || admin.isLocked) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    // Generate new tokens
    const newToken = generateToken(admin);
    const newRefreshToken = generateRefreshToken(admin);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
        expiresIn: process.env.JWT_EXPIRE || '24h'
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error.message);
    
    res.status(401).json({
      success: false,
      error: 'Invalid refresh token',
      code: 'REFRESH_TOKEN_INVALID'
    });
  }
};

// @desc    Get current admin profile
// @route   GET /api/admin/auth/me
// @access  Private
const getProfile = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        admin: req.admin.toJSON()
      }
    });
  } catch (error) {
    console.error('Get profile error:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Failed to get profile',
      code: 'PROFILE_ERROR'
    });
  }
};

// @desc    Update admin profile
// @route   PUT /api/admin/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { fullName, email, currentPassword, newPassword } = req.body;
    const admin = req.admin;

    // Update basic info
    if (fullName) admin.fullName = fullName;
    if (email) admin.email = email;

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          error: 'Current password is required to set new password',
          code: 'CURRENT_PASSWORD_REQUIRED'
        });
      }

      const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          error: 'Current password is incorrect',
          code: 'INVALID_CURRENT_PASSWORD'
        });
      }

      admin.password = newPassword;
    }

    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        admin: admin.toJSON()
      }
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        error: 'Email or username already exists',
        code: 'DUPLICATE_ENTRY'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to update profile',
        code: 'UPDATE_PROFILE_ERROR'
      });
    }
  }
};

// @desc    Forgot password
// @route   POST /api/admin/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
        code: 'EMAIL_REQUIRED'
      });
    }

    const admin = await AdminUser.findOne({ email, isActive: true });
    
    // Always return success to prevent email enumeration
    if (!admin) {
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
        data: { sent: false }
      });
    }

    // Generate reset token
    const resetToken = generatePasswordResetToken(admin);
    
    // Save reset token to admin (for tracking)
    admin.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    admin.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await admin.save({ validateBeforeSave: false });

    // TODO: Send email with reset token
    // await sendPasswordResetEmail(admin.email, resetToken);

    res.status(200).json({
      success: true,
      message: 'Password reset email sent (demo mode - no email sent)',
      data: { 
        sent: true,
        // In development, return token for testing
        ...(process.env.NODE_ENV === 'development' && { resetToken })
      }
    });
  } catch (error) {
    console.error('Forgot password error:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Failed to process password reset request',
      code: 'FORGOT_PASSWORD_ERROR'
    });
  }
};

// @desc    Reset password
// @route   POST /api/admin/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { token, password } = req.body;
    
    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    // Find admin with valid reset token
    const admin = await AdminUser.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
      isActive: true
    });

    if (!admin) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token',
        code: 'INVALID_RESET_TOKEN'
      });
    }

    // Set new password and clear reset fields
    admin.password = password;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpire = undefined;
    
    // Reset login attempts
    if (admin.loginAttempts > 0) {
      await admin.resetLoginAttempts();
    }

    await admin.save();

    // Log successful password reset
    console.log(`Password reset successful: ${admin.username} (${admin.email})`);

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Reset password error:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Failed to reset password',
      code: 'RESET_PASSWORD_ERROR'
    });
  }
};

// @desc    Change password (authenticated)
// @route   POST /api/admin/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const admin = req.admin;

    // Verify current password
    const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect',
        code: 'INVALID_CURRENT_PASSWORD'
      });
    }

    // Set new password
    admin.password = newPassword;
    
    // Reset login attempts if any
    if (admin.loginAttempts > 0) {
      await admin.resetLoginAttempts();
    }

    await admin.save();

    // Log successful password change
    console.log(`Password changed: ${admin.username} (${admin.email})`);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Failed to change password',
      code: 'CHANGE_PASSWORD_ERROR'
    });
  }
};

// @desc    Verify token
// @route   GET /api/admin/auth/verify
// @access  Private
const verifyToken = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: {
        admin: req.admin.toJSON(),
        tokenValid: true
      }
    });
  } catch (error) {
    console.error('Verify token error:', error.message);
    
    res.status(401).json({
      success: false,
      error: 'Invalid token',
      code: 'TOKEN_INVALID'
    });
  }
};

module.exports = {
  login,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyToken
};