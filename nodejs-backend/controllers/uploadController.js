const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { validationResult } = require('express-validator');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and random string
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const basename = path.basename(file.originalname, extension);
    cb(null, `${basename}-${uniqueSuffix}${extension}`);
  }
});

// File filter for images
const imageFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Configure multer upload
const upload = multer({
  storage: storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files at once
  }
});

// Single image upload
const uploadImage = (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    // Use multer upload
    const uploadSingle = upload.single('image');

    uploadSingle(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          // Multer error
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              error: 'File too large. Maximum size is 5MB.',
              code: 'FILE_TOO_LARGE'
            });
          } else if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
              success: false,
              error: 'Too many files. Maximum 10 files allowed.',
              code: 'TOO_MANY_FILES'
            });
          } else {
            return res.status(400).json({
              success: false,
              error: 'File upload error',
              code: 'UPLOAD_ERROR'
            });
          }
        } else {
          // Custom error
          return res.status(400).json({
            success: false,
            error: err.message,
            code: 'INVALID_FILE_TYPE'
          });
        }
      }

      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded',
          code: 'NO_FILE'
        });
      }

      // File uploaded successfully
      const fileUrl = `/uploads/${req.file.filename}`;

      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          url: fileUrl,
          path: req.file.path
        }
      });
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during upload',
      code: 'SERVER_ERROR'
    });
  }
};

// Multiple images upload
const uploadImages = (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    // Use multer upload for multiple files
    const uploadMultiple = upload.array('images', 10);

    uploadMultiple(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          // Multer error
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              error: 'One or more files are too large. Maximum size is 5MB per file.',
              code: 'FILE_TOO_LARGE'
            });
          } else if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
              success: false,
              error: 'Too many files. Maximum 10 files allowed.',
              code: 'TOO_MANY_FILES'
            });
          } else {
            return res.status(400).json({
              success: false,
              error: 'File upload error',
              code: 'UPLOAD_ERROR'
            });
          }
        } else {
          // Custom error
          return res.status(400).json({
            success: false,
            error: err.message,
            code: 'INVALID_FILE_TYPE'
          });
        }
      }

      // Check if files were uploaded
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No files uploaded',
          code: 'NO_FILES'
        });
      }

      // Files uploaded successfully
      const uploadedFiles = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: `/uploads/${file.filename}`,
        path: file.path
      }));

      res.status(200).json({
        success: true,
        message: `${req.files.length} image(s) uploaded successfully`,
        data: {
          files: uploadedFiles,
          count: req.files.length
        }
      });
    });
  } catch (error) {
    console.error('Upload images error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during upload',
      code: 'SERVER_ERROR'
    });
  }
};

// Get list of uploaded files
const getFiles = async (req, res) => {
  try {
    const uploadDir = path.join(__dirname, '../uploads');

    // Check if upload directory exists
    if (!fs.existsSync(uploadDir)) {
      return res.status(200).json({
        success: true,
        data: {
          files: [],
          count: 0
        }
      });
    }

    // Read directory contents
    const files = fs.readdirSync(uploadDir);

    // Get file information
    const fileInfo = files.map(filename => {
      const filePath = path.join(uploadDir, filename);
      const stats = fs.statSync(filePath);

      return {
        filename: filename,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        url: `/uploads/${filename}`,
        path: filePath
      };
    });

    // Sort by modification time (newest first)
    fileInfo.sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt));

    res.status(200).json({
      success: true,
      data: {
        files: fileInfo,
        count: fileInfo.length
      }
    });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve files',
      code: 'GET_FILES_ERROR'
    });
  }
};

// Get file information
const getFileInfo = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found',
        code: 'FILE_NOT_FOUND'
      });
    }

    // Get file stats
    const stats = fs.statSync(filePath);

    // Get file extension and determine if it's an image
    const ext = path.extname(filename).toLowerCase();
    const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext);

    const fileInfo = {
      filename: filename,
      size: stats.size,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
      url: `/uploads/${filename}`,
      path: filePath,
      isImage: isImage,
      extension: ext,
      mimetype: isImage ? `image/${ext.substring(1)}` : 'application/octet-stream'
    };

    res.status(200).json({
      success: true,
      data: fileInfo
    });
  } catch (error) {
    console.error('Get file info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get file information',
      code: 'GET_FILE_INFO_ERROR'
    });
  }
};

// Delete file
const deleteFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found',
        code: 'FILE_NOT_FOUND'
      });
    }

    // Delete file
    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete file',
      code: 'DELETE_FILE_ERROR'
    });
  }
};

// Cleanup old/unused files (Super Admin only)
const cleanupFiles = async (req, res) => {
  try {
    const { daysOld = 30 } = req.body;
    const uploadDir = path.join(__dirname, '../uploads');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    // Check if upload directory exists
    if (!fs.existsSync(uploadDir)) {
      return res.status(200).json({
        success: true,
        message: 'No files to clean up',
        data: { deletedCount: 0 }
      });
    }

    // Read directory contents
    const files = fs.readdirSync(uploadDir);
    let deletedCount = 0;

    for (const filename of files) {
      const filePath = path.join(uploadDir, filename);
      const stats = fs.statSync(filePath);

      // Delete files older than cutoff date
      if (stats.mtime < cutoffDate) {
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Cleanup completed. ${deletedCount} old file(s) deleted.`,
      data: {
        deletedCount,
        cutoffDate: cutoffDate.toISOString()
      }
    });
  } catch (error) {
    console.error('Cleanup files error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup files',
      code: 'CLEANUP_ERROR'
    });
  }
};

module.exports = {
  uploadImage,
  uploadImages,
  getFiles,
  getFileInfo,
  deleteFile,
  cleanupFiles
};