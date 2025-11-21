const express = require('express');
const {
  getWorkItems,
  getWorkItem,
  createWorkItem,
  updateWorkItem,
  deleteWorkItem
} = require('../controllers/workController');

const upload = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', getWorkItems);
router.get('/:id', getWorkItem);

// Protected routes (would need auth middleware in production)
router.post('/', upload.single('image'), createWorkItem);
router.put('/:id', upload.single('image'), updateWorkItem);
router.delete('/:id', deleteWorkItem);

module.exports = router;