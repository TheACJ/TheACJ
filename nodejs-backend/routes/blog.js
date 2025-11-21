const express = require('express');
const {
  getBlogPosts,
  getBlogPost,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost
} = require('../controllers/blogController');

const upload = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', getBlogPosts);
router.get('/:id', getBlogPost);

// Protected routes (would need auth middleware in production)
router.post('/', upload.single('image'), createBlogPost);
router.put('/:id', upload.single('image'), updateBlogPost);
router.delete('/:id', deleteBlogPost);

module.exports = router;