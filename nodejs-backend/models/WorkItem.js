const mongoose = require('mongoose');

const workItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  image: {
    type: String, // File path for uploaded image
    trim: true
  },
  gallery: [{
    type: String // Array of file paths for gallery images
  }],
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['planning', 'in-progress', 'completed'],
    default: 'planning'
  },
  client: {
    type: String,
    trim: true
  },
  url: {
    type: String,
    trim: true
  },
  github: {
    type: String,
    trim: true
  },
  technologies: [{
    type: String
  }],
  completionDate: {
    type: Date
  },
  link: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full image URL
workItemSchema.virtual('imageFullUrl').get(function() {
  if (this.image) {
    return `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${this.image}`;
  }
  return null;
});

// Index for better query performance
workItemSchema.index({ createdAt: -1 });

module.exports = mongoose.model('WorkItem', workItemSchema);