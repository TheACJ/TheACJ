const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../middleware/auth');
const contentController = require('../controllers/contentController');

// Public routes (no authentication required)
router.get('/public', contentController.getPublicContent);

// Get specific content section (admin)
router.get('/:sectionType', authenticateAdmin, contentController.getContentSection);

// Get all content sections (admin)
router.get('/', authenticateAdmin, contentController.getAllContent);

// Update content section (admin)
router.put('/:sectionType', authenticateAdmin, contentController.updateContentSection);

// Reset section to default (admin)
router.post('/reset/:sectionType', authenticateAdmin, contentController.resetToDefault);

module.exports = router;