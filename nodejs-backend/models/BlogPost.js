const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [20, 'Title cannot be more than 20 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    maxlength: [1024, 'Content cannot be more than 1024 characters']
  },
  datePublished: {
    type: Date,
    default: Date.now
  },
  imageUrl: {
    type: String,
    trim: true,
    maxlength: [1024, 'Image URL cannot be more than 1024 characters']
  },
  image: {
    type: String, // File path for uploaded image
    trim: true
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
blogPostSchema.virtual('imageFullUrl').get(function() {
  if (this.image) {
    return `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${this.image}`;
  }
  return this.imageUrl;
});

// Index for better query performance
blogPostSchema.index({ datePublished: -1 });
blogPostSchema.index({ category: 1 });

module.exports = mongoose.model('BlogPost', blogPostSchema);