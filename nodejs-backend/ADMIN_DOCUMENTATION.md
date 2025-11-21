# Admin Interface Documentation

## Overview

The Node.js backend now includes a comprehensive admin interface with authentication for managing the portfolio website content. The admin system provides secure access control, role-based permissions, and a user-friendly web interface for content management.

## Features

### 🔐 Authentication & Security
- **JWT-based authentication** with secure token handling
- **Role-based access control** (Admin and Super Admin roles)
- **Account security** with login attempt limiting and account locking
- **Password security** with bcrypt hashing
- **Session management** with automatic token refresh
- **CORS protection** and security headers

### 🎛️ Admin Dashboard
- **Real-time statistics** and analytics
- **Recent activity monitoring**
- **Monthly activity charts**
- **Quick action shortcuts**
- **Responsive design** for all device sizes

### 📝 Content Management
- **Blog Posts Management**
  - View, edit, delete blog posts
  - Bulk operations (publish, draft, delete)
  - Status management (draft/published)
  - Category assignment

- **Work Items Management**
  - Portfolio project management
  - Status tracking (draft/completed)
  - Bulk operations support
  - Image upload capabilities

- **Categories Management**
  - Create and organize content categories
  - Support for blog and work categories
  - Category assignment tools

- **Contact Management**
  - View all contact form submissions
  - Mark messages as read/unread
  - Bulk operations for message management
  - Email notifications support

### 👥 User Management (Super Admin Only)
- **Admin user creation and management**
- **Role assignment** (Admin/Super Admin)
- **Account status management** (Active/Inactive)
- **Security monitoring** and access control

### ⚙️ System Settings (Super Admin Only)
- **General site settings**
- **Security configuration**
- **Notification preferences**
- **System monitoring and maintenance**

## Installation & Setup

### 1. Prerequisites
- Node.js v16 or higher
- MongoDB database
- Environment variables configured

### 2. Environment Variables
Create a `.env` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/theacj_portfolio

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 3. Installation
```bash
cd nodejs-backend
npm install
```

### 4. Start the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Admin Interface Access

### Default Admin Account
The system automatically creates a default admin account on first run:

- **Username:** `admin`
- **Email:** `admin@theacj.com`
- **Password:** `admin123`
- **Role:** `super_admin`

⚠️ **Important:** Change the default password immediately after first login!

### Access URLs
- **Admin Login:** `http://localhost:5000/admin/login`
- **Dashboard:** `http://localhost:5000/admin/dashboard`
- **Blog Posts:** `http://localhost:5000/admin/blog-posts`
- **Work Items:** `http://localhost:5000/admin/work-items`
- **Contacts:** `http://localhost:5000/admin/contacts`
- **Categories:** `http://localhost:5000/admin/categories`
- **Users (Super Admin only):** `http://localhost:5000/admin/users`
- **Settings (Super Admin only):** `http://localhost:5000/admin/settings`

## API Endpoints

### Authentication Endpoints
```
POST   /api/admin/auth/login           # Admin login
POST   /api/admin/auth/logout          # Admin logout
POST   /api/admin/auth/refresh         # Refresh token
GET    /api/admin/auth/me              # Get current admin profile
PUT    /api/admin/auth/profile         # Update admin profile
POST   /api/admin/auth/forgot-password # Request password reset
POST   /api/admin/auth/reset-password  # Reset password
POST   /api/admin/auth/change-password # Change password
GET    /api/admin/auth/verify          # Verify token
```

### Dashboard Endpoints
```
GET    /api/admin/dashboard/stats      # Dashboard statistics
GET    /api/admin/dashboard/users      # Get admin users (Super Admin only)
POST   /api/admin/dashboard/users      # Create admin user (Super Admin only)
PUT    /api/admin/dashboard/users/:id  # Update admin user (Super Admin only)
DELETE /api/admin/dashboard/users/:id  # Delete admin user (Super Admin only)
GET    /api/admin/dashboard/settings   # Get settings (Super Admin only)
PUT    /api/admin/dashboard/settings   # Update settings (Super Admin only)
```

### Content Management Endpoints
```
# Blog Posts
GET    /api/admin/content/blog-posts           # Get all blog posts
PUT    /api/admin/content/blog-posts/bulk      # Bulk update blog posts
DELETE /api/admin/content/blog-posts/:id       # Delete blog post

# Work Items
GET    /api/admin/content/work-items           # Get all work items
PUT    /api/admin/content/work-items/bulk      # Bulk update work items

# Contacts
GET    /api/admin/content/contacts             # Get all contacts
PUT    /api/admin/content/contacts/:id/read    # Mark contact as read
PUT    /api/admin/content/contacts/bulk        # Bulk update contacts

# Categories
GET    /api/admin/content/categories           # Get all categories
POST   /api/admin/content/categories           # Create category
PUT    /api/admin/content/categories/:id       # Update category
DELETE /api/admin/content/categories/:id       # Delete category
```

## Role-Based Access Control

### Admin Role
- Access to dashboard
- Content management (blog posts, work items, contacts, categories)
- View statistics and recent activity
- Profile management

### Super Admin Role
- All Admin permissions
- User management (create, edit, delete admin users)
- System settings management
- Full system access

## Security Features

### Authentication Security
- **JWT tokens** with configurable expiration
- **Secure password hashing** using bcrypt
- **Account lockout** after 5 failed login attempts
- **Token refresh** mechanism for extended sessions
- **CSRF protection** with proper headers

### Authorization Security
- **Role-based access control** throughout the application
- **Route protection** with middleware authentication
- **API endpoint security** with proper validation
- **Admin interface protection** with authentication gates

### Data Security
- **Input validation** on all endpoints
- **SQL injection protection** with MongoDB
- **XSS protection** with proper sanitization
- **Rate limiting** to prevent abuse

## File Structure

```
nodejs-backend/
├── models/
│   ├── AdminUser.js          # Admin user model
│   ├── BlogPost.js           # Blog post model
│   ├── WorkItem.js           # Work item model
│   ├── Contact.js            # Contact model
│   └── Category.js           # Category model
├── controllers/
│   ├── adminAuthController.js      # Authentication logic
│   ├── adminDashboardController.js # Dashboard management
│   ├── adminContentController.js   # Content management
│   ├── blogController.js           # Blog posts logic
│   ├── workController.js           # Work items logic
│   ├── contactController.js        # Contact management
│   └── categoryController.js       # Category logic
├── routes/
│   ├── adminAuth.js         # Authentication routes
│   ├── adminDashboard.js    # Dashboard routes
│   ├── adminContent.js      # Content management routes
│   ├── blog.js              # Blog post routes
│   ├── work.js              # Work item routes
│   ├── contact.js           # Contact routes
│   └── category.js          # Category routes
├── middleware/
│   ├── auth.js              # Authentication middleware
│   ├── upload.js            # File upload handling
│   └── errorHandler.js      # Error handling
├── utils/
│   ├── jwt.js               # JWT utilities
│   └── emailService.js      # Email service
├── views/
│   └── admin/
│       ├── login.html       # Admin login page
│       ├── dashboard.html   # Admin dashboard
│       ├── blog-posts.html  # Blog posts management
│       ├── work-items.html  # Work items management
│       ├── contacts.html    # Contacts management
│       ├── categories.html  # Categories management
│       ├── users.html       # Users management (Super Admin)
│       └── settings.html    # Settings (Super Admin)
│   └── assets/
│       ├── admin.css        # Admin interface styles
│       └── admin.js         # Admin interface utilities
└── server.js                # Main server file
```

## Usage Examples

### Creating a New Admin User (Super Admin)
```javascript
// Via API
POST /api/admin/dashboard/users
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword",
  "fullName": "John Doe",
  "role": "admin"
}
```

### Authenticating an Admin User
```javascript
// Via API
POST /api/admin/auth/login
{
  "username": "admin",  // or email
  "password": "admin123",
  "rememberMe": true
}
```

### Getting Dashboard Statistics
```javascript
// Via API (requires authentication)
GET /api/admin/dashboard/stats
Authorization: Bearer <jwt-token>
```

## Troubleshooting

### Common Issues

1. **Cannot access admin interface**
   - Check if MongoDB is running
   - Verify JWT_SECRET is set in environment
   - Ensure default admin user was created

2. **Authentication failures**
   - Verify username/email and password
   - Check if account is locked due to failed attempts
   - Ensure JWT tokens are not expired

3. **Permission denied errors**
   - Ensure you're accessing correct pages for your role
   - Super Admin features require super_admin role

4. **Database connection issues**
   - Verify MONGODB_URI is correct
   - Check MongoDB server status
   - Ensure database exists

### Log Files
Check the console output for detailed error messages. The server logs include:
- Admin user creation status
- Authentication attempts
- Database connection status
- API request logging (development mode)

### Resetting Admin Password
If you forget the admin password, you can:
1. Delete the admin user from the database
2. Restart the server (it will recreate the default admin)
3. Or manually reset the password in MongoDB

## Best Practices

### Security
- Always use HTTPS in production
- Regularly rotate JWT secrets
- Monitor admin login attempts
- Keep admin account passwords secure
- Regular security updates

### Performance
- Implement caching for dashboard statistics
- Use pagination for large datasets
- Optimize database queries
- Monitor server performance

### Maintenance
- Regular database backups
- Monitor system logs
- Update dependencies regularly
- Plan for scaling

## Development

### Adding New Admin Features
1. Create controller methods in appropriate controller files
2. Add routes in the appropriate route files
3. Create/update admin interface pages in views/admin/
4. Add necessary middleware for authentication/authorization
5. Test thoroughly with different user roles

### Extending the API
1. Follow the existing route structure
2. Implement proper validation and error handling
3. Add authentication middleware where required
4. Document new endpoints

## Support

For technical support or questions about the admin interface:
- Check the server console for error messages
- Verify environment configuration
- Ensure all dependencies are properly installed
- Review the API documentation for endpoint usage

---

**Admin Interface Version:** 1.0.0  
**Last Updated:** November 2025  
**Compatible with:** Node.js 16+, MongoDB 4.4+