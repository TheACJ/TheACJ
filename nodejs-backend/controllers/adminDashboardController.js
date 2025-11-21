const AdminUser = require('../models/AdminUser');
const BlogPost = require('../models/BlogPost');
const WorkItem = require('../models/WorkItem');
const Contact = require('../models/Contact');
const Category = require('../models/Category');
const { validationResult } = require('express-validator');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const adminId = req.admin._id;
    
    // Get counts for different entities
    const [
      totalUsers,
      totalBlogPosts,
      totalWorkItems,
      totalContacts,
      totalCategories,
      activeUsers,
      publishedPosts,
      completedWorks,
      unreadContacts
    ] = await Promise.all([
      AdminUser.countDocuments({ isActive: true }),
      BlogPost.countDocuments(),
      WorkItem.countDocuments(),
      Contact.countDocuments(),
      Category.countDocuments(),
      AdminUser.countDocuments({ isActive: true }),
      BlogPost.countDocuments({ status: 'published' }),
      WorkItem.countDocuments({ status: 'completed' }),
      Contact.countDocuments({ isRead: false })
    ]);

    // Get recent activities
    const recentBlogPosts = await BlogPost.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status author createdAt');

    const recentContacts = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email subject isRead createdAt');

    // Get monthly statistics for charts
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const [
      postsThisMonth,
      contactsThisMonth,
      usersThisMonth
    ] = await Promise.all([
      BlogPost.countDocuments({
        createdAt: { $gte: currentMonth, $lt: nextMonth }
      }),
      Contact.countDocuments({
        createdAt: { $gte: currentMonth, $lt: nextMonth }
      }),
      AdminUser.countDocuments({
        createdAt: { $gte: currentMonth, $lt: nextMonth }
      })
    ]);

    const stats = {
      total: {
        users: totalUsers,
        blogPosts: totalBlogPosts,
        workItems: totalWorkItems,
        contacts: totalContacts,
        categories: totalCategories
      },
      active: {
        users: activeUsers,
        publishedPosts,
        completedWorks,
        unreadContacts
      },
      monthly: {
        posts: postsThisMonth,
        contacts: contactsThisMonth,
        users: usersThisMonth
      },
      recent: {
        blogPosts: recentBlogPosts,
        contacts: recentContacts
      }
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Failed to get dashboard statistics',
      code: 'DASHBOARD_STATS_ERROR'
    });
  }
};

// @desc    Get admin users list
// @route   GET /api/admin/users
// @access  Private (Super Admin)
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, status } = req.query;
    
    // Build filter
    const filter = {};
    
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      filter.role = role;
    }
    
    if (status !== undefined) {
      filter.isActive = status === 'true';
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get users
    const users = await AdminUser.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password');

    // Get total count for pagination
    const total = await AdminUser.countDocuments(filter);

    // Calculate pagination info
    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination
      }
    });
  } catch (error) {
    console.error('Get users error:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Failed to get users',
      code: 'GET_USERS_ERROR'
    });
  }
};

// @desc    Create new admin user
// @route   POST /api/admin/users
// @access  Private (Super Admin)
const createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { username, email, password, fullName, role = 'admin' } = req.body;

    // Check if user already exists
    const existingUser = await AdminUser.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email or username already exists',
        code: 'USER_EXISTS'
      });
    }

    // Create new user
    const newUser = new AdminUser({
      username,
      email,
      password,
      fullName,
      role,
      createdBy: req.admin._id
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: newUser.toJSON()
      }
    });
  } catch (error) {
    console.error('Create user error:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Failed to create user',
      code: 'CREATE_USER_ERROR'
    });
  }
};

// @desc    Update admin user
// @route   PUT /api/admin/users/:id
// @access  Private (Super Admin)
const updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { username, email, fullName, role, isActive } = req.body;

    // Find user
    const user = await AdminUser.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check for email/username conflicts
    if (username !== user.username || email !== user.email) {
      const existingUser = await AdminUser.findOne({
        _id: { $ne: id },
        $or: [{ email }, { username }]
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Email or username already exists',
          code: 'USER_EXISTS'
        });
      }
    }

    // Update user
    if (username) user.username = username;
    if (email) user.email = email;
    if (fullName) user.fullName = fullName;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: user.toJSON()
      }
    });
  } catch (error) {
    console.error('Update user error:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Failed to update user',
      code: 'UPDATE_USER_ERROR'
    });
  }
};

// @desc    Delete admin user
// @route   DELETE /api/admin/users/:id
// @access  Private (Super Admin)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if trying to delete self
    if (id === req.admin._id.toString()) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own account',
        code: 'CANNOT_DELETE_SELF'
      });
    }

    // Find and delete user
    const user = await AdminUser.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Failed to delete user',
      code: 'DELETE_USER_ERROR'
    });
  }
};

// @desc    Get activity logs
// @route   GET /api/admin/activity-logs
// @access  Private (Super Admin)
const getActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, adminId, action } = req.query;
    
    // This would typically come from a separate ActivityLog model
    // For now, we'll return a placeholder response
    
    res.status(200).json({
      success: true,
      data: {
        logs: [],
        pagination: {
          current: parseInt(page),
          pages: 0,
          total: 0,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get activity logs error:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Failed to get activity logs',
      code: 'ACTIVITY_LOGS_ERROR'
    });
  }
};

// @desc    Get system settings
// @route   GET /api/admin/settings
// @access  Private (Super Admin)
const getSettings = async (req, res) => {
  try {
    // This would typically come from a settings collection
    // For now, return basic settings
    const settings = {
      general: {
        siteName: 'The ACJ Portfolio',
        siteDescription: 'Professional Portfolio Website',
        adminEmail: 'admin@theacj.com',
        maintenanceMode: false
      },
      security: {
        sessionTimeout: 24,
        maxLoginAttempts: 5,
        passwordMinLength: 6
      },
      notifications: {
        emailNotifications: true,
        adminNotifications: true
      }
    };

    res.status(200).json({
      success: true,
      data: { settings }
    });
  } catch (error) {
    console.error('Get settings error:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Failed to get settings',
      code: 'GET_SETTINGS_ERROR'
    });
  }
};

// @desc    Update system settings
// @route   PUT /api/admin/settings
// @access  Private (Super Admin)
const updateSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    
    // This would typically update a settings collection
    // For now, just return success
    
    res.status(200).json({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Update settings error:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Failed to update settings',
      code: 'UPDATE_SETTINGS_ERROR'
    });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getActivityLogs,
  getSettings,
  updateSettings
};