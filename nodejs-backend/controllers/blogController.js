const BlogPost = require('../models/BlogPost');
const Category = require('../models/Category');

// @desc    Get all blog posts
// @route   GET /api/blog-posts
// @access  Public
const getBlogPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const blogPosts = await BlogPost.find()
      .populate('category', 'name friendlyName')
      .sort({ datePublished: -1 })
      .skip(skip)
      .limit(limit);

    const total = await BlogPost.countDocuments();

    res.status(200).json({
      success: true,
      count: blogPosts.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      data: blogPosts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single blog post
// @route   GET /api/blog-posts/:id
// @access  Public
const getBlogPost = async (req, res, next) => {
  try {
    const blogPost = await BlogPost.findById(req.params.id)
      .populate('category', 'name friendlyName');

    if (!blogPost) {
      return res.status(404).json({
        success: false,
        error: 'Blog post not found'
      });
    }

    res.status(200).json({
      success: true,
      data: blogPost
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new blog post
// @route   POST /api/blog-posts
// @access  Private/Admin
const createBlogPost = async (req, res, next) => {
  try {
    const { title, content, category, imageUrl, link } = req.body;

    // Handle file upload
    let image = null;
    if (req.file) {
      image = req.file.filename;
    }

    const blogPost = await BlogPost.create({
      title,
      content,
      category: category || null,
      imageUrl,
      image,
      link
    });

    const populatedPost = await BlogPost.findById(blogPost._id)
      .populate('category', 'name friendlyName');

    res.status(201).json({
      success: true,
      data: populatedPost
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update blog post
// @route   PUT /api/blog-posts/:id
// @access  Private/Admin
const updateBlogPost = async (req, res, next) => {
  try {
    const { title, content, category, imageUrl, link } = req.body;

    let updateData = {
      title,
      content,
      category: category || null,
      imageUrl,
      link
    };

    // Handle file upload
    if (req.file) {
      updateData.image = req.file.filename;
    }

    const blogPost = await BlogPost.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).populate('category', 'name friendlyName');

    if (!blogPost) {
      return res.status(404).json({
        success: false,
        error: 'Blog post not found'
      });
    }

    res.status(200).json({
      success: true,
      data: blogPost
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete blog post
// @route   DELETE /api/blog-posts/:id
// @access  Private/Admin
const deleteBlogPost = async (req, res, next) => {
  try {
    const blogPost = await BlogPost.findById(req.params.id);

    if (!blogPost) {
      return res.status(404).json({
        success: false,
        error: 'Blog post not found'
      });
    }

    await blogPost.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBlogPosts,
  getBlogPost,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost
};