const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [254, 'Category name cannot be more than 254 characters'],
    unique: true
  },
  friendlyName: {
    type: String,
    trim: true,
    maxlength: [254, 'Friendly name cannot be more than 254 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for getting friendly name
categorySchema.virtual('getFriendlyName').get(function() {
  return this.friendlyName || this.name;
});

// Ensure virtual fields are serialised
categorySchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Category', categorySchema);