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
      const os = require('os');
      const process = require('process');

      // Get CPU information
      const cpus = os.cpus();
      const cpuCount = cpus.length;
      
      // Calculate CPU usage (average over 1 second)
      const cpuUsage = await new Promise((resolve) => {
         const startMeasure = cpuAverage();
         setTimeout(() => {
            const endMeasure = cpuAverage();
            const idleDifference = endMeasure.idle - startMeasure.idle;
            const totalDifference = endMeasure.total - startMeasure.total;
            const percentageCPU = 100 - ~~(100 * idleDifference / totalDifference);
            resolve(percentageCPU);
         }, 1000);
      });

      function cpuAverage() {
         let totalIdle = 0;
         let totalTick = 0;
         cpus.forEach(cpu => {
            for (let type in cpu.times) {
               totalTick += cpu.times[type];
            }
            totalIdle += cpu.times.idle;
         });
         return {
            idle: totalIdle / cpus.length,
            total: totalTick / cpus.length
         };
      }

      // Get memory information
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      const memoryUsagePercent = Math.round((usedMemory / totalMemory) * 100);

      // Format memory
      const formatBytes = (bytes) => {
         const gb = bytes / (1024 * 1024 * 1024);
         return {
            value: Math.round(gb * 100) / 100,
            unit: 'GB',
            formatted: `${Math.round(gb * 100) / 100} GB`
         };
      };

      // Get load average (Unix-like systems)
      const loadAvg = os.loadavg();
      const loadAverage = loadAvg.map(load => Math.round(load * 100) / 100);

      // Get uptime
      const uptimeSeconds = os.uptime();
      const uptimeDays = Math.floor(uptimeSeconds / 86400);
      const uptimeHours = Math.floor((uptimeSeconds % 86400) / 3600);
      const uptimeMinutes = Math.floor((uptimeSeconds % 3600) / 60);

      // Get process memory
      const processMemory = process.memoryUsage();
      const processMemoryFormatted = formatBytes(processMemory.heapUsed);

      // Get network interfaces (basic info)
      const networkInterfaces = os.networkInterfaces();
      let networkInfo = {
         interfaces: Object.keys(networkInterfaces).length,
         addresses: []
      };

      Object.keys(networkInterfaces).forEach(interfaceName => {
         networkInterfaces[interfaceName].forEach(iface => {
            if (iface.family === 'IPv4' && !iface.internal) {
               networkInfo.addresses.push({
                  interface: interfaceName,
                  address: iface.address
               });
            }
         });
      });

      // Get platform info
      const platform = os.platform();
      const arch = os.arch();
      const hostname = os.hostname();
      const nodeVersion = process.version;

      const performance = {
         cpu: {
            usage: cpuUsage,
            cores: cpuCount,
            model: cpus[0]?.model || 'Unknown',
            loadAverage: loadAverage,
            load: loadAverage // For compatibility
         },
         memory: {
            used: memoryUsagePercent,
            total: formatBytes(totalMemory).formatted,
            usedGB: formatBytes(usedMemory).formatted,
            freeGB: formatBytes(freeMemory).formatted,
            totalBytes: totalMemory,
            usedBytes: usedMemory,
            freeBytes: freeMemory
         },
         process: {
            memory: processMemoryFormatted.formatted,
            memoryBytes: processMemory.heapUsed,
            uptime: Math.floor(process.uptime()),
            pid: process.pid
         },
         network: {
            interfaces: networkInfo.interfaces,
            addresses: networkInfo.addresses,
            hostname: hostname
         },
         system: {
            platform: platform,
            arch: arch,
            nodeVersion: nodeVersion,
            uptime: {
               days: uptimeDays,
               hours: uptimeHours,
               minutes: uptimeMinutes,
               seconds: Math.floor(uptimeSeconds)
            }
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

      // Get top referrers from page views using referrerDomain
      const referrerStats = await PageView.aggregate([
         {
            $match: {
               timestamp: { $gte: startDate },
               referrerDomain: { $ne: null, $ne: '', $exists: true }
            }
         },
         {
            $group: {
               _id: '$referrerDomain',
               visitors: { $sum: 1 },
               uniqueSessions: { $addToSet: '$sessionId' },
               uniqueIPs: { $addToSet: '$ipAddress' }
            }
         },
         {
            $project: {
               source: '$_id',
               visitors: 1,
               uniqueSessions: { $size: '$uniqueSessions' },
               uniqueIPs: { $size: '$uniqueIPs' }
            }
         },
         {
            $sort: { visitors: -1 }
         },
         {
            $limit: 20
         }
      ]);

         // Calculate bounce rates for each referrer
         const referrersWithBounce = await Promise.all(
            referrerStats.map(async (ref) => {
               // Get sessions that came from this referrer and only viewed one page
               const singlePageSessions = await Session.aggregate([
                  {
                     $match: {
                        startTime: { $gte: startDate },
                        referrerDomain: ref.source
                     }
                  },
                  {
                     $project: {
                        sessionId: 1,
                        pageCount: { $size: { $ifNull: ['$pages', []] } }
                     }
                  },
                  {
                     $match: {
                        pageCount: { $lte: 1 }
                     }
                  }
               ]);

               const totalSessions = ref.uniqueSessions;
               const bounceRate = totalSessions > 0 
                  ? Math.round((singlePageSessions.length / totalSessions) * 100)
                  : 0;

               return {
                  ...ref,
                  bounceRate
               };
            })
         );

      // Process referrer data and add icons
      const referrers = referrersWithBounce.map(ref => {
         const source = ref.source.toLowerCase();
         let icon = 'fas fa-globe';
         let displayName = ref.source;

         // Set appropriate icon based on domain
         if (source.includes('google')) {
            icon = 'fab fa-google';
            displayName = 'Google';
         } else if (source.includes('github')) {
            icon = 'fab fa-github';
            displayName = 'GitHub';
         } else if (source.includes('linkedin')) {
            icon = 'fab fa-linkedin';
            displayName = 'LinkedIn';
         } else if (source.includes('twitter') || source.includes('x.com')) {
            icon = 'fab fa-twitter';
            displayName = 'Twitter/X';
         } else if (source.includes('facebook')) {
            icon = 'fab fa-facebook';
            displayName = 'Facebook';
         } else if (source.includes('youtube')) {
            icon = 'fab fa-youtube';
            displayName = 'YouTube';
         } else if (source.includes('reddit')) {
            icon = 'fab fa-reddit';
            displayName = 'Reddit';
         } else if (source.includes('instagram')) {
            icon = 'fab fa-instagram';
            displayName = 'Instagram';
         } else {
            displayName = ref.source.replace('www.', '');
         }

         return {
            source: displayName,
            domain: ref.source,
            icon,
            visitors: ref.visitors,
            uniqueVisitors: ref.uniqueIPs,
            sessions: ref.uniqueSessions,
            bounceRate: ref.bounceRate
         };
      });

      // Get direct traffic
      const directStats = await PageView.aggregate([
         {
            $match: {
               timestamp: { $gte: startDate },
               $or: [
                  { referrer: { $in: [null, '', undefined] } },
                  { referrerDomain: { $in: [null, '', undefined] } }
               ]
            }
         },
         {
            $group: {
               _id: null,
               visitors: { $sum: 1 },
               uniqueSessions: { $addToSet: '$sessionId' },
               uniqueIPs: { $addToSet: '$ipAddress' }
            }
         }
      ]);

      if (directStats.length > 0 && directStats[0].visitors > 0) {
         const direct = directStats[0];
         const directSessions = await Session.countDocuments({
            startTime: { $gte: startDate },
            $or: [
               { referrer: { $in: [null, '', undefined] } },
               { referrerDomain: { $in: [null, '', undefined] } }
            ]
         });

         const singlePageDirect = await Session.aggregate([
            {
               $match: {
                  startTime: { $gte: startDate },
                  $or: [
                     { referrer: { $in: [null, '', undefined] } },
                     { referrerDomain: { $in: [null, '', undefined] } }
                  ]
               }
            },
            {
               $project: {
                  sessionId: 1,
                  pageCount: { $size: { $ifNull: ['$pages', []] } }
               }
            },
            {
               $match: {
                  pageCount: { $lte: 1 }
               }
            }
         ]);

         const bounceRate = directSessions > 0
            ? Math.round((singlePageDirect.length / directSessions) * 100)
            : 0;

         referrers.push({
            source: 'Direct',
            domain: 'direct',
            icon: 'fas fa-link',
            visitors: direct.visitors,
            uniqueVisitors: direct.uniqueIPs,
            sessions: direct.uniqueSessions,
            bounceRate
         });
      }

      // Sort by visitors and take top 10
      referrers.sort((a, b) => b.visitors - a.visitors);
      const topReferrers = referrers.slice(0, 10);

      res.status(200).json({
         success: true,
         data: {
            referrers: topReferrers,
            totalVisitors: topReferrers.reduce((sum, ref) => sum + ref.visitors, 0),
            period
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

// @desc    Get comprehensive traffic overview
// @route   GET /api/admin/dashboard/traffic-overview
// @access  Private
const getTrafficOverview = async (req, res) => {
   try {
      const { PageView, Session } = require('../models/Analytics');
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
         case '24h':
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
         default:
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      // Get all metrics in parallel
      const [
         totalPageViews,
         uniqueVisitors,
         uniqueSessions,
         deviceBreakdown,
         browserBreakdown,
         osBreakdown,
         topPages,
         topIPs,
         hourlyDistribution,
         referrerStats,
         countryStats,
         connectionTypeStats
      ] = await Promise.all([
         // Total page views
         PageView.countDocuments({ timestamp: { $gte: startDate } }),

         // Unique visitors (by IP)
         PageView.distinct('ipAddress', { timestamp: { $gte: startDate } }),

         // Unique sessions
         Session.countDocuments({ startTime: { $gte: startDate } }),

         // Device breakdown
         PageView.aggregate([
            { $match: { timestamp: { $gte: startDate }, deviceType: { $exists: true } } },
            { $group: { _id: '$deviceType', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
         ]),

         // Browser breakdown
         PageView.aggregate([
            { $match: { timestamp: { $gte: startDate }, browser: { $exists: true } } },
            { $group: { _id: '$browser', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
         ]),

         // OS breakdown
         PageView.aggregate([
            { $match: { timestamp: { $gte: startDate }, os: { $exists: true } } },
            { $group: { _id: '$os', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
         ]),

         // Top pages
         PageView.aggregate([
            { $match: { timestamp: { $gte: startDate } } },
            { $group: { _id: '$page', views: { $sum: 1 }, uniqueVisitors: { $addToSet: '$ipAddress' } } },
            { $project: { page: '$_id', views: 1, uniqueVisitors: { $size: '$uniqueVisitors' } } },
            { $sort: { views: -1 } },
            { $limit: 10 }
         ]),

         // Top IPs
         PageView.aggregate([
            { $match: { timestamp: { $gte: startDate }, ipAddress: { $ne: null, $ne: 'unknown' } } },
            { $group: { _id: '$ipAddress', views: { $sum: 1 }, sessions: { $addToSet: '$sessionId' } } },
            { $project: { ip: '$_id', views: 1, sessions: { $size: '$sessions' } } },
            { $sort: { views: -1 } },
            { $limit: 20 }
         ]),

         // Hourly distribution
         PageView.aggregate([
            { $match: { timestamp: { $gte: startDate } } },
            {
               $group: {
                  _id: { $hour: '$timestamp' },
                  count: { $sum: 1 }
               }
            },
            { $sort: { '_id': 1 } }
         ]),

         // Referrer stats
         PageView.aggregate([
            { $match: { timestamp: { $gte: startDate }, referrerDomain: { $ne: null, $exists: true } } },
            { $group: { _id: '$referrerDomain', count: { $sum: 1 }, uniqueIPs: { $addToSet: '$ipAddress' } } },
            { $project: { domain: '$_id', count: 1, uniqueVisitors: { $size: '$uniqueIPs' } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
         ]),

         // Country stats (if available)
         PageView.aggregate([
            { $match: { timestamp: { $gte: startDate }, country: { $ne: null, $exists: true } } },
            { $group: { _id: '$country', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
         ]),

         // Connection type stats
         PageView.aggregate([
            { $match: { timestamp: { $gte: startDate }, connectionType: { $ne: null, $exists: true } } },
            { $group: { _id: '$connectionType', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
         ])
      ]);

      // Calculate average session duration
      const sessionDurationStats = await Session.aggregate([
         { $match: { startTime: { $gte: startDate }, duration: { $exists: true, $ne: null } } },
         {
            $group: {
               _id: null,
               avgDuration: { $avg: '$duration' },
               minDuration: { $min: '$duration' },
               maxDuration: { $max: '$duration' }
            }
         }
      ]);

      // Calculate bounce rate
      const singlePageSessions = await Session.countDocuments({
         startTime: { $gte: startDate },
         $expr: { $eq: [{ $size: '$pages' }, 1] }
      });

      const bounceRate = uniqueSessions > 0
         ? Math.round((singlePageSessions / uniqueSessions) * 100)
         : 0;

      // Format hourly distribution
      const hourlyData = Array.from({ length: 24 }, (_, i) => {
         const hourData = hourlyDistribution.find(h => h._id === i);
         return {
            hour: i,
            count: hourData ? hourData.count : 0
         };
      });

      // Get recent traffic (last 24 hours)
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const recentPageViews = await PageView.countDocuments({ timestamp: { $gte: last24Hours } });
      const recentUniqueVisitors = (await PageView.distinct('ipAddress', { timestamp: { $gte: last24Hours } })).length;

      const overview = {
         period,
         summary: {
            totalPageViews,
            uniqueVisitors: uniqueVisitors.length,
            uniqueSessions,
            recentPageViews24h: recentPageViews,
            recentUniqueVisitors24h: recentUniqueVisitors,
            averageSessionDuration: sessionDurationStats[0]?.avgDuration 
               ? Math.round(sessionDurationStats[0].avgDuration / 1000) // Convert to seconds
               : 0,
            bounceRate
         },
         breakdowns: {
            devices: deviceBreakdown.map(d => ({ type: d._id, count: d.count })),
            browsers: browserBreakdown.map(b => ({ browser: b._id, count: b.count })),
            operatingSystems: osBreakdown.map(o => ({ os: o._id, count: o.count })),
            connectionTypes: connectionTypeStats.map(c => ({ type: c._id, count: c.count }))
         },
         topPages: topPages.map(p => ({
            page: p.page,
            views: p.views,
            uniqueVisitors: p.uniqueVisitors
         })),
         topIPs: topIPs.map(ip => ({
            ip: ip.ip,
            views: ip.views,
            sessions: ip.sessions
         })),
         hourlyDistribution: hourlyData,
         topReferrers: referrerStats.map(r => ({
            domain: r.domain,
            visits: r.count || 0,
            uniqueVisitors: r.uniqueVisitors || 0
         })),
         topCountries: countryStats.map(c => ({
            country: c._id,
            count: c.count
         }))
      };

      res.status(200).json({
         success: true,
         data: overview
      });
   } catch (error) {
      console.error('Get traffic overview error:', error.message);

      res.status(500).json({
         success: false,
         error: 'Failed to get traffic overview',
         code: 'TRAFFIC_OVERVIEW_ERROR'
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
   getReferrerAnalytics,
   getTrafficOverview
};