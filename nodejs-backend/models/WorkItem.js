const mongoose = require('mongoose');

const workItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [20, 'Title cannot be more than 20 characters']
  },
  category: {
    type: String,
    trim: true,
    maxlength: [20, 'Category cannot be more than 20 characters']
  },
  image: {
    type: String, // File path for uploaded image
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1024, 'Description cannot be more than 1024 characters']
  },
  link: {
    type: String,
    trim: true,
    maxlength: [1024, 'Link cannot be more than 1024 characters']
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