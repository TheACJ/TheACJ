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
      unreadContacts,
      unreadNotifications
    ] = await Promise.all([
      AdminUser.countDocuments({ isActive: true }),
      BlogPost.countDocuments(),
      WorkItem.countDocuments(),
      Contact.countDocuments(),
      Category.countDocuments(),
      AdminUser.countDocuments({ isActive: true }),
      BlogPost.countDocuments({ status: 'published' }),
      WorkItem.countDocuments({ status: 'completed' }),
      Contact.countDocuments({ isRead: false }),
      Contact.countDocuments({ isRead: false }) // For now, notifications = unread contacts
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

    // Get monthly statistics for charts and changes
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const lastMonth = new Date(currentMonth);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const [
      postsThisMonth,
      contactsThisMonth,
      usersThisMonth,
      postsLastMonth,
      contactsLastMonth,
      usersLastMonth
    ] = await Promise.all([
      BlogPost.countDocuments({
        createdAt: { $gte: currentMonth, $lt: nextMonth }
      }),
      Contact.countDocuments({
        createdAt: { $gte: currentMonth, $lt: nextMonth }
      }),
      AdminUser.countDocuments({
        createdAt: { $gte: currentMonth, $lt: nextMonth }
      }),
      BlogPost.countDocuments({
        createdAt: { $gte: lastMonth, $lt: currentMonth }
      }),
      Contact.countDocuments({
        createdAt: { $gte: lastMonth, $lt: currentMonth }
      }),
      AdminUser.countDocuments({
        createdAt: { $gte: lastMonth, $lt: currentMonth }
      })
    ]);

    // Calculate percentage changes
    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const changes = {
      users: calculateChange(usersThisMonth, usersLastMonth),
      posts: calculateChange(postsThisMonth, postsLastMonth),
      contacts: calculateChange(contactsThisMonth, contactsLastMonth)
    };

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
      changes,
      notifications: unreadNotifications,
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

// @desc    Get traffic analytics
// @route   GET /api/admin/dashboard/analytics/traffic
// @access  Private
const getTrafficAnalytics = async (req, res) => {
   try {
      const { period = 'week' } = req.query;
      const { PageView, Session } = require('../models/Analytics');

      // Calculate date range based on period
      const now = new Date();
      let startDate;

      switch (period) {
         case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            break;
         case 'year':
            startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            break;
         default: // week
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      // Get page views by date
      const pageViewsByDate = await PageView.aggregate([
         {
            $match: {
               timestamp: { $gte: startDate }
            }
         },
         {
            $group: {
               _id: {
                  $dateToString: {
                     format: period === 'year' ? '%Y-%m' : '%Y-%m-%d',
                     date: '$timestamp'
                  }
               },
               count: { $sum: 1 }
            }
         },
         {
            $sort: { '_id': 1 }
         }
      ]);

      // Get unique sessions by date
      const sessionsByDate = await Session.aggregate([
         {
            $match: {
               startTime: { $gte: startDate }
            }
         },
         {
            $group: {
               _id: {
                  $dateToString: {
                     format: period === 'year' ? '%Y-%m' : '%Y-%m-%d',
                     date: '$startTime'
                  }
               },
               count: { $sum: 1 }
            }
         },
         {
            $sort: { '_id': 1 }
         }
      ]);

      // Generate labels and data arrays
      const labels = [];
      const pageViews = [];
      const uniqueVisitors = [];

      // Create date range
      const dateRange = [];
      let currentDate = new Date(startDate);

      while (currentDate <= now) {
         const dateKey = period === 'year'
            ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
            : currentDate.toISOString().split('T')[0];

         dateRange.push(dateKey);

         // Find data for this date
         const pageViewData = pageViewsByDate.find(p => p._id === dateKey);
         const sessionData = sessionsByDate.find(s => s._id === dateKey);

         pageViews.push(pageViewData ? pageViewData.count : 0);
         uniqueVisitors.push(sessionData ? sessionData.count : 0);

         // Increment date
         if (period === 'year') {
            currentDate.setMonth(currentDate.getMonth() + 1);
         } else {
            currentDate.setDate(currentDate.getDate() + 1);
         }
      }

      res.status(200).json({
         success: true,
         data: {
            labels: dateRange,
            datasets: {
               pageViews,
               uniqueVisitors
            },
            summary: {
               totalPageViews: pageViews.reduce((a, b) => a + b, 0),
               totalUniqueVisitors: uniqueVisitors.reduce((a, b) => a + b, 0),
               averagePageViews: pageViews.length > 0 ? Math.round(pageViews.reduce((a, b) => a + b, 0) / pageViews.length) : 0,
               averageUniqueVisitors: uniqueVisitors.length > 0 ? Math.round(uniqueVisitors.reduce((a, b) => a + b, 0) / uniqueVisitors.length) : 0
            }
         }
      });
   } catch (error) {
      console.error('Get traffic analytics error:', error.message);

      res.status(500).json({
         success: false,
         error: 'Failed to get traffic analytics',
         code: 'TRAFFIC_ANALYTICS_ERROR'
      });
   }
};

// @desc    Get content distribution
// @route   GET /api/admin/dashboard/analytics/content-distribution
// @access  Private
const getContentDistribution = async (req, res) => {
   try {
      const [
         blogPostsCount,
         workItemsCount,
         categoriesCount,
         contactsCount
      ] = await Promise.all([
         BlogPost.countDocuments(),
         WorkItem.countDocuments(),
         Category.countDocuments(),
         Contact.countDocuments()
      ]);

      const total = blogPostsCount + workItemsCount + categoriesCount + contactsCount;

      const distribution = [
         {
            name: 'Blog Posts',
            value: blogPostsCount,
            percentage: total > 0 ? Math.round((blogPostsCount / total) * 100) : 0
         },
         {
            name: 'Work Items',
            value: workItemsCount,
            percentage: total > 0 ? Math.round((workItemsCount / total) * 100) : 0
         },
         {
            name: 'Categories',
            value: categoriesCount,
            percentage: total > 0 ? Math.round((categoriesCount / total) * 100) : 0
         },
         {
            name: 'Contacts',
            value: contactsCount,
            percentage: total > 0 ? Math.round((contactsCount / total) * 100) : 0
         }
      ];

      res.status(200).json({
         success: true,
         data: {
            distribution,
            total
         }
      });
   } catch (error) {
      console.error('Get content distribution error:', error.message);

      res.status(500).json({
         success: false,
         error: 'Failed to get content distribution',
         code: 'CONTENT_DISTRIBUTION_ERROR'
      });
   }
};

// @desc    Get system performance metrics
// @route   GET /api/admin/dashboard/system/performance
// @access  Private
const getSystemPerformance = async (req, res) => {
   try {
      // In a real application, you would get these from system monitoring tools
      // For now, we'll return mock data
      const performance = {
         cpu: {
            usage: Math.floor(Math.random() * 30) + 20, // 20-50%
            cores: 4,
            load: [0.2, 0.3, 0.1, 0.4]
         },
         memory: {
            used: Math.floor(Math.random() * 30) + 40, // 40-70%
            total: '8 GB',
            usedGB: '4.2 GB',
            freeGB: '3.8 GB'
         },
         disk: {
            used: Math.floor(Math.random() * 20) + 50, // 50-70%
            total: '100 GB',
            usedGB: '62 GB',
            freeGB: '38 GB'
         },
         network: {
            upload: Math.floor(Math.random() * 10) + 5, // 5-15 MB/s
            download: Math.floor(Math.random() * 20) + 10, // 10-30 MB/s
            connections: Math.floor(Math.random() * 50) + 20 // 20-70 connections
         },
         uptime: {
            days: Math.floor(Math.random() * 30) + 1,
            hours: Math.floor(Math.random() * 24),
            minutes: Math.floor(Math.random() * 60)
         }
      };

      res.status(200).json({
         success: true,
         data: performance
      });
   } catch (error) {
      console.error('Get system performance error:', error.message);

      res.status(500).json({
         success: false,
         error: 'Failed to get system performance',
         code: 'SYSTEM_PERFORMANCE_ERROR'
      });
   }
};

// @desc    Get referrer analytics
// @route   GET /api/admin/dashboard/analytics/referrers
// @access  Private
const getReferrerAnalytics = async (req, res) => {
   try {
      const { PageView, Session } = require('../models/Analytics');

      // Get top referrers from page views
      const referrerStats = await PageView.aggregate([
         {
            $match: {
               referrer: { $ne: null, $ne: '', $not: { $regex: '^https?://[^/]*localhost' } }
            }
         },
         {
            $group: {
               _id: '$referrer',
               visitors: { $sum: 1 },
               uniqueSessions: { $addToSet: '$sessionId' }
            }
         },
         {
            $project: {
               source: '$_id',
               visitors: 1,
               uniqueSessions: { $size: '$uniqueSessions' }
            }
         },
         {
            $sort: { visitors: -1 }
         },
         {
            $limit: 10
         }
      ]);

      // Process referrer data and add icons
      const referrers = referrerStats.map(ref => {
         const source = ref.source.toLowerCase();
         let icon = 'fas fa-globe';
         let displayName = ref.source;

         // Extract domain and set appropriate icon
         try {
            const url = new URL(ref.source);
            displayName = url.hostname.replace('www.', '');

            if (displayName.includes('google')) {
               icon = 'fab fa-google';
            } else if (displayName.includes('github')) {
               icon = 'fab fa-github';
            } else if (displayName.includes('linkedin')) {
               icon = 'fab fa-linkedin';
            } else if (displayName.includes('twitter') || displayName.includes('x.com')) {
               icon = 'fab fa-twitter';
            } else if (displayName.includes('facebook')) {
               icon = 'fab fa-facebook';
            } else if (displayName.includes('youtube')) {
               icon = 'fab fa-youtube';
            }
         } catch (e) {
            // If URL parsing fails, use the original referrer
         }

         return {
            source: displayName,
            icon,
            visitors: ref.visitors,
            bounceRate: Math.floor(Math.random() * 40) + 20 // Mock bounce rate for now
         };
      });

      // Add "Direct" traffic if we have sessions without referrers
      const directSessions = await PageView.countDocuments({
         referrer: { $in: [null, '', undefined] }
      });

      if (directSessions > 0) {
         referrers.push({
            source: 'Direct',
            icon: 'fas fa-link',
            visitors: directSessions,
            bounceRate: Math.floor(Math.random() * 30) + 40
         });
      }

      // Sort by visitors and take top 5
      referrers.sort((a, b) => b.visitors - a.visitors);
      const topReferrers = referrers.slice(0, 5);

      res.status(200).json({
         success: true,
         data: {
            referrers: topReferrers,
            totalVisitors: topReferrers.reduce((sum, ref) => sum + ref.visitors, 0)
         }
      });
   } catch (error) {
      console.error('Get referrer analytics error:', error.message);

      res.status(500).json({
         success: false,
         error: 'Failed to get referrer analytics',
         code: 'REFERRER_ANALYTICS_ERROR'
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
   updateSettings,
   getTrafficAnalytics,
   getContentDistribution,
   getSystemPerformance,
   getReferrerAnalytics
};