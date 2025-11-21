const WorkItem = require('../models/WorkItem');

// @desc    Get all work items
// @route   GET /api/works
// @access  Public
const getWorkItems = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const workItems = await WorkItem.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await WorkItem.countDocuments();

    res.status(200).json({
      success: true,
      count: workItems.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      data: workItems
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single work item
// @route   GET /api/works/:id
// @access  Public
const getWorkItem = async (req, res, next) => {
  try {
    const workItem = await WorkItem.findById(req.params.id);

    if (!workItem) {
      return res.status(404).json({
        success: false,
        error: 'Work item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: workItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new work item
// @route   POST /api/works
// @access  Private/Admin
const createWorkItem = async (req, res, next) => {
  try {
    const { title, category, description, link } = req.body;

    // Handle file upload
    let image = null;
    if (req.file) {
      image = req.file.filename;
    }

    const workItem = await WorkItem.create({
      title,
      category,
      description,
      link,
      image
    });

    res.status(201).json({
      success: true,
      data: workItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update work item
// @route   PUT /api/works/:id
// @access  Private/Admin
const updateWorkItem = async (req, res, next) => {
  try {
    const { title, category, description, link } = req.body;

    let updateData = {
      title,
      category,
      description,
      link
    };

    // Handle file upload
    if (req.file) {
      updateData.image = req.file.filename;
    }

    const workItem = await WorkItem.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!workItem) {
      return res.status(404).json({
        success: false,
        error: 'Work item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: workItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete work item
// @route   DELETE /api/works/:id
// @access  Private/Admin
const deleteWorkItem = async (req, res, next) => {
  try {
    const workItem = await WorkItem.findById(req.params.id);

    if (!workItem) {
      return res.status(404).json({
        success: false,
        error: 'Work item not found'
      });
    }

    await workItem.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWorkItems,
  getWorkItem,
  createWorkItem,
  updateWorkItem,
  deleteWorkItem
};