const AdminUser = require('../models/AdminUser');
const { 
  verifyToken, 
  getTokenFromHeader, 
  getTokenFromCookie 
} = require('../utils/jwt');

// Middleware to authenticate admin user
const authenticateAdmin = async (req, res, next) => {
  try {
    // Get token from header or cookie
    const token = getTokenFromHeader(req) || getTokenFromCookie(req);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    
    // Check if admin user exists and is active
    const admin = await AdminUser.findById(decoded.id).select('-password');
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token. Admin user not found.',
        code: 'USER_NOT_FOUND'
      });
    }

    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated.',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Check if account is locked
    if (admin.isLocked) {
      return res.status(423).json({
        success: false,
        error: 'Account is locked. Please try again later.',
        code: 'ACCOUNT_LOCKED'
      });
    }

    // Add admin info to request object
    req.admin = admin;
    req.token = token;
    req.tokenData = decoded;
    
    next();
  } catch (error) {
    if (error.message === 'Token expired') {
      return res.status(401).json({
        success: false,
        error: 'Token expired. Please log in again.',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    return res.status(401).json({
      success: false,
      error: 'Invalid token.',
      code: 'INVALID_TOKEN'
    });
  }
};

// Middleware to check admin role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.',
        code: 'AUTH_REQUIRED'
      });
    }

    const userRoles = Array.isArray(req.admin.role) ? req.admin.role : [req.admin.role];
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    
    const hasRole = requiredRoles.some(role => userRoles.includes(role));
    
    if (!hasRole) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions.',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: requiredRoles,
        current: userRoles
      });
    }

    next();
  };
};

// Middleware to check if admin is super_admin
const requireSuperAdmin = requireRole('super_admin');

// Middleware to optionally authenticate (for protected routes that can work without auth)
const optionalAuth = async (req, res, next) => {
  try {
    const token = getTokenFromHeader(req) || getTokenFromCookie(req);
    
    if (token) {
      const decoded = verifyToken(token);
      const admin = await AdminUser.findById(decoded.id).select('-password');
      
      if (admin && admin.isActive && !admin.isLocked) {
        req.admin = admin;
        req.token = token;
        req.tokenData = decoded;
      }
    }
    
    next();
  } catch (error) {
    // If token is invalid, just continue without authentication
    next();
  }
};

// Middleware to log admin activity
const logActivity = (action) => {
  return (req, res, next) => {
    if (req.admin) {
      req.adminActivity = {
        action,
        adminId: req.admin._id,
        adminUsername: req.admin.username,
        timestamp: new Date(),
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        method: req.method,
        url: req.originalUrl
      };
    }
    next();
  };
};

// Middleware to validate admin session
const validateSession = async (req, res, next) => {
  try {
    if (!req.admin) {
      return next();
    }

    const admin = await AdminUser.findById(req.admin._id);
    
    if (!admin || !admin.isActive || admin.isLocked) {
      return res.status(401).json({
        success: false,
        error: 'Session invalid. Please log in again.',
        code: 'INVALID_SESSION'
      });
    }

    // Update last activity time
    admin.lastActivity = new Date();
    await admin.save({ validateBeforeSave: false });
    
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Session validation failed.',
      code: 'SESSION_VALIDATION_ERROR'
    });
  }
};

// Middleware to check for concurrent sessions (optional)
const checkConcurrentSessions = async (req, res, next) => {
  try {
    if (!req.admin) {
      return next();
    }

    // This would typically check against a session store
    // For now, we'll just continue
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Session check failed.',
      code: 'SESSION_CHECK_ERROR'
    });
  }
};

// Rate limiting middleware for sensitive operations
const sensitiveOperationLimit = (req, res, next) => {
  const sensitiveEndpoints = [
    '/api/admin/users/delete',
    '/api/admin/users/reset-password',
    '/api/admin/settings'
  ];
  
  const isSensitiveEndpoint = sensitiveEndpoints.some(endpoint => 
    req.originalUrl.includes(endpoint)
  );
  
  if (isSensitiveEndpoint && req.admin?.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      error: 'This operation requires super admin privileges.',
      code: 'SUPER_ADMIN_REQUIRED'
    });
  }
  
  next();
};

module.exports = {
  authenticateAdmin,
  requireRole,
  requireSuperAdmin,
  optionalAuth,
  logActivity,
  validateSession,
  checkConcurrentSessions,
  sensitiveOperationLimit
};