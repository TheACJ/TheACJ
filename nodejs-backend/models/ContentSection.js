const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  title: String,
  value: String,
  icon: String
});

const skillSchema = new mongoose.Schema({
  name: String,
  level: Number,
  icon: String
});

const serviceSchema = new mongoose.Schema({
  title: String,
  description: String,
  icon: String,
  order: Number
});

const slideSchema = new mongoose.Schema({
  title: String,
  subtitle: String,
  description: String,
  bgImage: String,
  buttonText: String,
  buttonIcon: String,
  buttonLink: String
});

const contentSectionSchema = new mongoose.Schema({
  sectionType: {
    type: String,
    enum: ['hero', 'about', 'services', 'counter', 'skills'],
    required: true,
    unique: true
  },
  hero: {
    slides: [slideSchema],
    socialLinks: [{
      platform: String,
      url: String,
      icon: String
    }]
  },
  about: {
    title: String,
    description: String,
    image: String,
    achievements: [String]
  },
  services: [serviceSchema],
  counter: [counterSchema],
  skills: [skillSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for better query performance
contentSectionSchema.index({ sectionType: 1 });
contentSectionSchema.index({ isActive: 1, sectionType: 1 }); // Compound index for common query

module.exports = mongoose.model('ContentSection', contentSectionSchema);