const mongoose = require('mongoose');

const workItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  technologies: [{
    type: String
  }],
  project_url: {
    type: String,
    trim: true
  },
  github_url: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['planning', 'in-progress', 'completed', 'published'],
    default: 'planning'
  },
  featured_image: {
    type: String,
    trim: true
  },
  gallery_images: [{
    type: String
  }],
  start_date: {
    type: Date
  },
  end_date: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full image URL
workItemSchema.virtual('imageFullUrl').get(function() {
  if (this.featured_image) {
    return `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${this.featured_image}`;
  }
  return null;
});

// Virtual for full gallery image URLs
workItemSchema.virtual('galleryFullUrls').get(function() {
  if (this.gallery_images && this.gallery_images.length > 0) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    return this.gallery_images.map(image => `${baseUrl}/uploads/${image}`);
  }
  return [];
});

// Index for better query performance
workItemSchema.index({ createdAt: -1 });
workItemSchema.index({ category: 1 });
workItemSchema.index({ status: 1 });

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