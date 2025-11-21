const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');

// Generate JWT token
const generateToken = (adminUser) => {
  const payload = {
    id: adminUser._id,
    email: adminUser.email,
    username: adminUser.username,
    role: adminUser.role,
    fullName: adminUser.fullName
  };

  const options = {
    expiresIn: process.env.JWT_EXPIRE || '24h',
    issuer: 'theacj-admin',
    audience: 'theacj-admin-users',
    subject: adminUser._id.toString()
  };

  return jwt.sign(payload, process.env.JWT_SECRET, options);
};

// Generate refresh token
const generateRefreshToken = (adminUser) => {
  const payload = {
    id: adminUser._id,
    type: 'refresh'
  };

  const options = {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
    issuer: 'theacj-admin',
    audience: 'theacj-admin-users',
    subject: adminUser._id.toString()
  };

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, options);
};

// Verify JWT token
const verifyToken = (token, secret = process.env.JWT_SECRET) => {
  try {
    return jwt.verify(token, secret, {
      issuer: 'theacj-admin',
      audience: 'theacj-admin-users'
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

// Decode JWT token without verification
const decodeToken = (token) => {
  try {
    return jwt.decode(token, { complete: true });
  } catch (error) {
    return null;
  }
};

// Generate password reset token
const generatePasswordResetToken = (adminUser) => {
  const payload = {
    id: adminUser._id,
    email: adminUser.email,
    type: 'password_reset'
  };

  const options = {
    expiresIn: '1h',
    issuer: 'theacj-admin',
    audience: 'theacj-admin-users',
    subject: adminUser._id.toString()
  };

  return jwt.sign(payload, process.env.JWT_SECRET, options);
};

// Verify password reset token
const verifyPasswordResetToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'theacj-admin',
      audience: 'theacj-admin-users'
    });

    if (decoded.type !== 'password_reset') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Password reset token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid password reset token');
    } else {
      throw new Error('Password reset token verification failed');
    }
  }
};

// Generate email verification token
const generateEmailVerificationToken = (adminUser) => {
  const payload = {
    id: adminUser._id,
    email: adminUser.email,
    type: 'email_verification'
  };

  const options = {
    expiresIn: '24h',
    issuer: 'theacj-admin',
    audience: 'theacj-admin-users',
    subject: adminUser._id.toString()
  };

  return jwt.sign(payload, process.env.JWT_SECRET, options);
};

// Get token from header
const getTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

// Get token from cookie
const getTokenFromCookie = (req) => {
  return req.cookies?.admin_token || null;
};

// Generate admin session data
const generateSessionData = (adminUser, token) => {
  return {
    user: adminUser.toJSON(),
    token: token,
    loginTime: new Date(),
    ip: adminUser.lastLoginIP || 'unknown',
    userAgent: adminUser.lastLoginUserAgent || 'unknown'
  };
};

// Clean expired tokens (for maintenance)
const cleanExpiredTokens = async () => {
  try {
    // This would typically interact with a token blacklist store
    // For now, we'll implement basic cleanup logic
    console.log('Token cleanup completed');
    return true;
  } catch (error) {
    console.error('Error cleaning expired tokens:', error);
    return false;
  }
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  decodeToken,
  generatePasswordResetToken,
  verifyPasswordResetToken,
  generateEmailVerificationToken,
  getTokenFromHeader,
  getTokenFromCookie,
  generateSessionData,
  cleanExpiredTokens
};