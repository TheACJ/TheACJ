const BlogPost = require('../models/BlogPost');
const WorkItem = require('../models/WorkItem');
const Contact = require('../models/Contact');
const Category = require('../models/Category');
const { validationResult } = require('express-validator');
const uploadController = require('./uploadController');

// BLOG POSTS MANAGEMENT

// @desc    Get all blog posts (admin view)
// @route   GET /api/admin/content/blog-posts
// @access  Private
const getAllBlogPosts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      category, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Get posts
    const posts = await BlogPost.find(filter)
      .populate('category', 'name')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await BlogPost.countDocuments(filter);

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
        posts,
        pagination
      }
    });
  } catch (error) {
    console.error('Get all blog posts error:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Failed to get blog posts',
      code: 'GET_BLOG_POSTS_ERROR'
    });
  }
};

// @desc    Bulk update blog posts
// @route   PUT /api/admin/content/blog-posts/bulk
// @access  Private
const bulkUpdateBlogPosts = async (req, res) => {
  try {
    const { postIds, action, data } = req.body;

    if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Post IDs are required',
        code: 'INVALID_POST_IDS'
      });
    }

    let updateData = {};
    let message = '';

    switch (action) {
      case 'publish':
        updateData = { status: 'published' };
        message = 'Posts published successfully';
        break;
      case 'draft':
        updateData = { status: 'draft' };
        message = 'Posts moved to draft successfully';
        break;
      case 'delete':
        await BlogPost.deleteMany({ _id: { $in: postIds } });
        return res.status(200).json({
          success: true,
          message: 'Posts deleted successfully'
        });
      case 'update':
        updateData = data;
        message = 'Posts updated successfully';
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid action',
          code: 'INVALID_ACTION'
        });
    }

    await BlogPost.updateMany(
      { _id: { $in: postIds } },
      updateData
    );

    res.status(200).json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Bulk update blog posts error:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Failed to bulk update posts',
      code: 'BULK_UPDATE_ERROR'
    });
  }
};

// @desc    Delete blog post (admin)
// @route   DELETE /api/admin/content/blog-posts/:id
// @access  Private
const deleteBlogPost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await BlogPost.findByIdAndDelete(id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Blog post not found',
        code: 'POST_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    console.error('Delete blog post error:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Failed to delete blog post',
      code: 'DELETE_POST_ERROR'
    });
  }
};

// WORK ITEMS MANAGEMENT

// @desc    Get all work items (admin view)
// @route   GET /api/admin/content/work-items
// @access  Private
const getAllWorkItems = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { technologies: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Get work items
    const workItems = await WorkItem.find(filter)
      .populate('category', 'name')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await WorkItem.countDocuments(filter);

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
        workItems,
        pagination
      }
    });
  } catch (error) {
    console.error('Get all work items error:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Failed to get work items',
      code: 'GET_WORK_ITEMS_ERROR'
    });
  }
};

// @desc    Bulk update work items
// @route   PUT /api/admin/content/work-items/bulk
// @access  Private
const bulkUpdateWorkItems = async (req, res) => {
  try {
    const { workItemIds, action, data } = req.body;

    if (!workItemIds || !Array.isArray(workItemIds) || workItemIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Work item IDs are required',
        code: 'INVALID_WORK_ITEM_IDS'
      });
    }

    let updateData = {};
    let message = '';

    switch (action) {
      case 'publish':
        updateData = { status: 'published' };
        message = 'Work items published successfully';
        break;
      case 'draft':
        updateData = { status: 'draft' };
        message = 'Work items moved to draft successfully';
        break;
      case 'delete':
        await WorkItem.deleteMany({ _id: { $in: workItemIds } });
        return res.status(200).json({
          success: true,
          message: 'Work items deleted successfully'
        });
      case 'update':
        updateData = data;
        message = 'Work items updated successfully';
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid action',
          code: 'INVALID_ACTION'
        });
    }

    await WorkItem.updateMany(
      { _id: { $in: workItemIds } },
      updateData
    );

    res.status(200).json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Bulk update work items error:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Failed to bulk update work items',
      code: 'BULK_UPDATE_ERROR'
    });
  }
};

// CONTACTS MANAGEMENT

// @desc    Get all contacts (admin view)
// @route   GET /api/admin/content/contacts
// @access  Private
const getAllContacts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      isRead, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = {};
    
    if (isRead !== undefined) {
      filter.isRead = isRead === 'true';
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Get contacts
    const contacts = await Contact.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Contact.countDocuments(filter);

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
        contacts,
        pagination
      }
    });
  } catch (error) {
    console.error('Get all contacts error:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Failed to get contacts',
      code: 'GET_CONTACTS_ERROR'
    });
  }
};

// @desc    Mark contact as read
// @route   PUT /api/admin/content/contacts/:id/read
// @access  Private
const markContactAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found',
        code: 'CONTACT_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact marked as read',
      data: { contact }
    });
  } catch (error) {
    console.error('Mark contact as read error:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Failed to mark contact as read',
      code: 'MARK_READ_ERROR'
    });
  }
};

// @desc    Bulk update contacts
// @route   PUT /api/admin/content/contacts/bulk
// @access  Private
const bulkUpdateContacts = async (req, res) => {
  try {
    const { contactIds, action, data } = req.body;

    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Contact IDs are required',
        code: 'INVALID_CONTACT_IDS'
      });
    }

    let updateData = {};
    let message = '';

    switch (action) {
      case 'read':
        updateData = { isRead: true };
        message = 'Contacts marked as read';
        break;
      case 'unread':
        updateData = { isRead: false };
        message = 'Contacts marked as unread';
        break;
      case 'delete':
        await Contact.deleteMany({ _id: { $in: contactIds } });
        return res.status(200).json({
          success: true,
          message: 'Contacts deleted successfully'
        });
      case 'update':
        updateData = data;
        message = 'Contacts updated successfully';
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid action',
          code: 'INVALID_ACTION'
        });
    }

    await Contact.updateMany(
      { _id: { $in: contactIds } },
      updateData
    );

    res.status(200).json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Bulk update contacts error:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Failed to bulk update contacts',
      code: 'BULK_UPDATE_ERROR'
    });
  }
};

// CATEGORIES MANAGEMENT

// @desc    Get all categories (admin view)
// @route   GET /api/admin/content/categories
// @access  Private
const getAllCategories = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type,
      search,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Build filter
    const filter = {};
    
    if (type) {
      filter.type = type;
    }
    
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Get categories
    const categories = await Category.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Category.countDocuments(filter);

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
        categories,
        pagination
      }
    });
  } catch (error) {
    console.error('Get all categories error:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Failed to get categories',
      code: 'GET_CATEGORIES_ERROR'
    });
  }
};

// @desc    Create category (admin)
// @route   POST /api/admin/content/categories
// @access  Private
const createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, description, type } = req.body;

    const category = new Category({
      name,
      description,
      type
    });

    await category.save();

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category }
    });
  } catch (error) {
    console.error('Create category error:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Failed to create category',
      code: 'CREATE_CATEGORY_ERROR'
    });
  }
};

// @desc    Update category (admin)
// @route   PUT /api/admin/content/categories/:id
// @access  Private
const updateCategory = async (req, res) => {
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
    const { name, description, type } = req.body;

    const category = await Category.findByIdAndUpdate(
      id,
      { name, description, type },
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
        code: 'CATEGORY_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: { category }
    });
  } catch (error) {
    console.error('Update category error:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Failed to update category',
      code: 'UPDATE_CATEGORY_ERROR'
    });
  }
};

// @desc    Delete category (admin)
// @route   DELETE /api/admin/content/categories/:id
// @access  Private
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndDelete(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
        code: 'CATEGORY_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Failed to delete category',
      code: 'DELETE_CATEGORY_ERROR'
    });
  }
};

// @desc    Create blog post (admin)
// @route   POST /api/admin/content/blog-posts
// @access  Private
const createBlogPost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { title, content, category, status, excerpt, metaDescription, tags } = req.body;
    const author = req.admin.fullName || req.admin.username;

    const postData = {
      title,
      content,
      category,
      status,
      excerpt,
      metaDescription,
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
      author
    };

    // Handle featured image upload
    if (req.file) {
      postData.featuredImage = `/uploads/${req.file.filename}`;
    }

    const post = new BlogPost(postData);
    await post.save();

    // Populate category for response
    await post.populate('category', 'name');

    res.status(201).json({
      success: true,
      message: 'Blog post created successfully',
      data: { post }
    });
  } catch (error) {
    console.error('Create blog post error:', error.message);

    res.status(500).json({
      success: false,
      error: 'Failed to create blog post',
      code: 'CREATE_POST_ERROR'
    });
  }
};

// @desc    Update blog post (admin)
// @route   PUT /api/admin/content/blog-posts/:id
// @access  Private
const updateBlogPost = async (req, res) => {
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
    const { title, content, category, status, excerpt, metaDescription, tags } = req.body;

    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (category !== undefined) updateData.category = category;
    if (status !== undefined) updateData.status = status;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription;
    if (tags !== undefined) {
      updateData.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }

    // Handle featured image upload
    if (req.file) {
      updateData.featuredImage = `/uploads/${req.file.filename}`;
    }

    const post = await BlogPost.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name');

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Blog post not found',
        code: 'POST_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Blog post updated successfully',
      data: { post }
    });
  } catch (error) {
    console.error('Update blog post error:', error.message);

    res.status(500).json({
      success: false,
      error: 'Failed to update blog post',
      code: 'UPDATE_POST_ERROR'
    });
  }
};

// @desc    Create work item (admin)
// @route   POST /api/admin/content/work-items
// @access  Private
const createWorkItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      title,
      description,
      category,
      status,
      client,
      url,
      github,
      technologies,
      completionDate
    } = req.body;

    const workData = {
      title,
      description,
      category,
      status,
      client,
      url,
      github,
      technologies: technologies ? technologies.split(',').map(tech => tech.trim()).filter(tech => tech) : [],
      completionDate: completionDate ? new Date(completionDate) : null
    };

    // Handle main image upload
    if (req.files && req.files.image && req.files.image[0]) {
      workData.image = `/uploads/${req.files.image[0].filename}`;
    }

    // Handle gallery images
    if (req.files && req.files.gallery && req.files.gallery.length > 0) {
      workData.gallery = req.files.gallery.map(file => `/uploads/${file.filename}`);
    }

    const workItem = new WorkItem(workData);
    await workItem.save();

    // Populate category for response
    await workItem.populate('category', 'name');

    res.status(201).json({
      success: true,
      message: 'Work item created successfully',
      data: { workItem }
    });
  } catch (error) {
    console.error('Create work item error:', error.message);

    res.status(500).json({
      success: false,
      error: 'Failed to create work item',
      code: 'CREATE_WORK_ITEM_ERROR'
    });
  }
};

// @desc    Update work item (admin)
// @route   PUT /api/admin/content/work-items/:id
// @access  Private
const updateWorkItem = async (req, res) => {
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
    const {
      title,
      description,
      category,
      status,
      client,
      url,
      github,
      technologies,
      completionDate
    } = req.body;

    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (status !== undefined) updateData.status = status;
    if (client !== undefined) updateData.client = client;
    if (url !== undefined) updateData.url = url;
    if (github !== undefined) updateData.github = github;
    if (technologies !== undefined) {
      updateData.technologies = technologies.split(',').map(tech => tech.trim()).filter(tech => tech);
    }
    if (completionDate !== undefined) {
      updateData.completionDate = completionDate ? new Date(completionDate) : null;
    }

    // Handle main image upload
    if (req.files && req.files.image && req.files.image[0]) {
      updateData.image = `/uploads/${req.files.image[0].filename}`;
    }

    // Handle gallery images (append to existing gallery)
    if (req.files && req.files.gallery && req.files.gallery.length > 0) {
      const newGalleryImages = req.files.gallery.map(file => `/uploads/${file.filename}`);
      // Note: In a real implementation, you might want to merge with existing gallery
      updateData.gallery = newGalleryImages;
    }

    const workItem = await WorkItem.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name');

    if (!workItem) {
      return res.status(404).json({
        success: false,
        error: 'Work item not found',
        code: 'WORK_ITEM_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Work item updated successfully',
      data: { workItem }
    });
  } catch (error) {
    console.error('Update work item error:', error.message);

    res.status(500).json({
      success: false,
      error: 'Failed to update work item',
      code: 'UPDATE_WORK_ITEM_ERROR'
    });
  }
};

// @desc    Delete work item (admin)
// @route   DELETE /api/admin/content/work-items/:id
// @access  Private
const deleteWorkItem = async (req, res) => {
  try {
    const { id } = req.params;

    const workItem = await WorkItem.findByIdAndDelete(id);

    if (!workItem) {
      return res.status(404).json({
        success: false,
        error: 'Work item not found',
        code: 'WORK_ITEM_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Work item deleted successfully'
    });
  } catch (error) {
    console.error('Delete work item error:', error.message);

    res.status(500).json({
      success: false,
      error: 'Failed to delete work item',
      code: 'DELETE_WORK_ITEM_ERROR'
    });
  }
};

module.exports = {
  getAllBlogPosts,
  createBlogPost,
  updateBlogPost,
  bulkUpdateBlogPosts,
  deleteBlogPost,
  getAllWorkItems,
  createWorkItem,
  updateWorkItem,
  bulkUpdateWorkItems,
  deleteWorkItem,
  getAllContacts,
  markContactAsRead,
  bulkUpdateContacts,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
};