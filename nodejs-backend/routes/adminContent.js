const express = require('express');
const { body } = require('express-validator');
const adminContentController = require('../controllers/adminContentController');
const { authenticateAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    // Ensure upload directory exists
    const fs = require('fs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const basename = path.basename(file.originalname, extension);
    cb(null, `${basename}-${uniqueSuffix}${extension}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateAdmin);

// BLOG POSTS MANAGEMENT
router.get('/blog-posts', adminContentController.getAllBlogPosts);
router.post('/blog-posts',
  upload.single('featuredImage'),
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required'),
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Content is required'),
    body('category')
      .notEmpty()
      .withMessage('Category is required'),
    body('status')
      .isIn(['draft', 'published'])
      .withMessage('Status must be draft or published')
  ],
  adminContentController.createBlogPost
);
router.put('/blog-posts/:id',
  upload.single('featuredImage'),
  [
    body('title')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Title cannot be empty'),
    body('content')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Content cannot be empty'),
    body('category')
      .optional()
      .notEmpty()
      .withMessage('Category is required'),
    body('status')
      .optional()
      .isIn(['draft', 'published'])
      .withMessage('Status must be draft or published')
  ],
  adminContentController.updateBlogPost
);
router.put('/blog-posts/bulk', adminContentController.bulkUpdateBlogPosts);
router.delete('/blog-posts/:id', adminContentController.deleteBlogPost);

// WORK ITEMS MANAGEMENT
router.get('/work-items', adminContentController.getAllWorkItems);
router.post('/work-items',
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'gallery', maxCount: 10 }
  ]),
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required'),
    body('description')
      .trim()
      .notEmpty()
      .withMessage('Description is required'),
    body('category')
      .notEmpty()
      .withMessage('Category is required'),
    body('status')
      .isIn(['planning', 'in-progress', 'completed'])
      .withMessage('Status must be planning, in-progress, or completed')
  ],
  adminContentController.createWorkItem
);
router.put('/work-items/:id',
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'gallery', maxCount: 10 }
  ]),
  [
    body('title')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Title cannot be empty'),
    body('description')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Description cannot be empty'),
    body('category')
      .optional()
      .notEmpty()
      .withMessage('Category is required'),
    body('status')
      .optional()
      .isIn(['planning', 'in-progress', 'completed'])
      .withMessage('Status must be planning, in-progress, or completed')
  ],
  adminContentController.updateWorkItem
);
router.put('/work-items/bulk', adminContentController.bulkUpdateWorkItems);
router.delete('/work-items/:id', adminContentController.deleteWorkItem);

// CONTACTS MANAGEMENT
router.get('/contacts', adminContentController.getAllContacts);
router.put('/contacts/:id/read', adminContentController.markContactAsRead);
router.put('/contacts/bulk', adminContentController.bulkUpdateContacts);

// CATEGORIES MANAGEMENT
router.get('/categories', adminContentController.getAllCategories);
router.post('/categories',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Category name is required'),
    body('type')
      .isIn(['blog', 'work'])
      .withMessage('Type must be either blog or work')
  ],
  adminContentController.createCategory
);
router.put('/categories/:id',
  [
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Category name cannot be empty'),
    body('type')
      .optional()
      .isIn(['blog', 'work'])
      .withMessage('Type must be either blog or work')
  ],
  adminContentController.updateCategory
);
router.delete('/categories/:id', adminContentController.deleteCategory);

// Health check for admin content management
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin content management is running',
    timestamp: new Date().toISOString(),
    admin: {
      id: req.admin._id,
      username: req.admin.username,
      role: req.admin.role
    }
  });
});

module.exports = router;