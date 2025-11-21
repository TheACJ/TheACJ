# Admin Interface - The ACJ Portfolio Backend

A comprehensive admin interface built with Node.js, Express, and MongoDB for managing The ACJ Portfolio website content.

## 🚀 Features

### Authentication & Security
- JWT-based authentication with refresh tokens
- Role-based access control (admin, super_admin)
- Account lockout after failed login attempts
- Password reset functionality
- Session management with secure cookies

### Dashboard
- Real-time statistics and analytics
- Monthly activity charts
- Recent activity feed
- Quick action buttons

### Content Management
- **Blog Posts**: Create, edit, publish, draft, and delete blog posts
- **Work Items**: Manage portfolio work items with categories
- **Contacts**: View and manage contact form submissions
- **Categories**: Create and manage content categories

### User Management (Super Admin Only)
- Create and manage admin users
- Role assignment and permissions
- User activity tracking
- Account status management

## 🛠️ Installation & Setup

### 1. Install Dependencies
```bash
cd nodejs-backend
npm install
```

### 2. Environment Configuration
Update `.env` file with your settings:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-here
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

### 3. Start the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 4. Access Admin Interface
Open your browser and navigate to:
```
http://localhost:5000/admin/login
```

## 🔐 Default Admin Credentials

On first run, a default admin user is automatically created:
- **Username**: `admin`
- **Email**: `admin@theacj.com`
- **Password**: `admin123`

⚠️ **Important**: Change these credentials immediately after first login!

## 📊 API Endpoints

### Authentication
```
POST /api/admin/auth/login          - Admin login
POST /api/admin/auth/logout         - Admin logout
GET  /api/admin/auth/me             - Get current admin profile
PUT  /api/admin/auth/profile        - Update admin profile
POST /api/admin/auth/change-password - Change password
POST /api/admin/auth/forgot-password - Forgot password
POST /api/admin/auth/reset-password  - Reset password
POST /api/admin/auth/refresh        - Refresh token
```

### Dashboard
```
GET  /api/admin/dashboard/stats     - Get dashboard statistics
GET  /api/admin/dashboard/health    - Health check
```

### User Management (Super Admin)
```
GET    /api/admin/dashboard/users   - Get all admin users
POST   /api/admin/dashboard/users   - Create new admin user
PUT    /api/admin/dashboard/users/:id - Update admin user
DELETE /api/admin/dashboard/users/:id - Delete admin user
```

### Content Management
```
# Blog Posts
GET  /api/admin/content/blog-posts      - Get all blog posts
PUT  /api/admin/content/blog-posts/bulk - Bulk update blog posts
DELETE /api/admin/content/blog-posts/:id - Delete blog post

# Work Items
GET  /api/admin/content/work-items      - Get all work items
PUT  /api/admin/content/work-items/bulk - Bulk update work items

# Contacts
GET  /api/admin/content/contacts         - Get all contacts
PUT  /api/admin/content/contacts/:id/read - Mark contact as read
PUT  /api/admin/content/contacts/bulk    - Bulk update contacts

# Categories
GET  /api/admin/content/categories       - Get all categories
POST /api/admin/content/categories       - Create category
PUT  /api/admin/content/categories/:id   - Update category
DELETE /api/admin/content/categories/:id - Delete category
```

## 🎨 Admin Interface

### Pages
1. **Login Page** (`/admin/login`)
   - Secure login form
   - Password reset functionality
   - Remember me option

2. **Dashboard** (`/admin/dashboard`)
   - Statistics overview
   - Recent activity
   - Monthly charts
   - Quick actions

3. **Content Management**
   - Blog Posts management
   - Work Items management
   - Contact management
   - Category management

4. **User Management** (Super Admin only)
   - Admin user CRUD operations
   - Role management
   - Activity logs

## 🔒 Security Features

### Authentication
- JWT tokens with secure HTTP-only cookies
- Refresh token mechanism
- Session validation
- Account lockout protection

### Authorization
- Role-based access control
- Route-level middleware protection
- Resource-level permissions

### Security Headers
- Helmet.js for security headers
- CORS configuration
- Rate limiting
- Input validation and sanitization

## 🏗️ Architecture

### Models
- `AdminUser` - Admin user authentication and management
- `BlogPost` - Blog post content
- `WorkItem` - Portfolio work items
- `Contact` - Contact form submissions
- `Category` - Content categories

### Controllers
- `adminAuthController` - Authentication logic
- `adminDashboardController` - Dashboard functionality
- `adminContentController` - Content management
- `blogController` - Blog operations
- `workController` - Work items operations
- `contactController` - Contact management
- `categoryController` - Category management

### Middleware
- `auth` - Authentication and authorization
- `errorHandler` - Global error handling
- `upload` - File upload handling

### Routes
- Authentication routes
- Dashboard routes
- Content management routes
- User management routes

## 🚀 Testing

### Manual Testing
1. Start the server
2. Navigate to `/admin/login`
3. Login with default credentials
4. Test dashboard functionality
5. Try content management features
6. Test user management (if super admin)

### API Testing
```bash
# Test health endpoint
curl http://localhost:5000/health

# Test admin authentication
curl -X POST http://localhost:5000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Test protected endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/admin/dashboard/stats
```

## 🔧 Development

### Project Structure
```
nodejs-backend/
├── controllers/          # Route controllers
├── middleware/           # Custom middleware
├── models/              # Mongoose models
├── routes/              # Express routes
├── utils/               # Utility functions
├── views/               # Admin interface HTML
│   ├── admin/          # Admin pages
│   └── assets/         # CSS, JS, images
├── config/             # Configuration files
├── uploads/            # File uploads
└── server.js           # Main server file
```

### Adding New Features
1. Create model in `models/` directory
2. Add controller methods in `controllers/`
3. Define routes in `routes/`
4. Add middleware if needed
5. Update admin interface if required

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check MongoDB connection string
   - Verify network access to MongoDB Atlas
   - Check IP whitelist settings

2. **JWT Token Issues**
   - Verify JWT_SECRET is set
   - Check token expiration settings
   - Ensure proper token format

3. **Login Failures**
   - Check default admin creation
   - Verify credentials
   - Check account lockout status

4. **Static File Issues**
   - Ensure uploads directory exists
   - Check file permissions
   - Verify static file paths

### Debug Mode
Set `NODE_ENV=development` for detailed error messages and logging.

## 📝 License

ISC License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Check the troubleshooting section
- Review API documentation
- Test with sample data
- Check server logs for errors

---

**Admin Interface v1.0.0** - Built with Node.js, Express, and MongoDB