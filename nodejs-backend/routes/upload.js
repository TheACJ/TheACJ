const express = require('express');
const uploadController = require('../controllers/uploadController');
const { authenticateAdmin, requireSuperAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateAdmin);

// File upload routes
router.post('/image', uploadController.uploadImage);
router.post('/images', uploadController.uploadImages);

// File management routes
router.get('/files', uploadController.getFiles);
router.get('/file/:filename/info', uploadController.getFileInfo);
router.delete('/file/:filename', uploadController.deleteFile);

// Cleanup routes (Super Admin only)
router.post('/cleanup', requireSuperAdmin, uploadController.cleanupFiles);

// Health check for upload system
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Upload system is running',
    timestamp: new Date().toISOString(),
    admin: {
      id: req.admin._id,
      username: req.admin.username,
      role: req.admin.role
    }
  });
});

module.exports = router;