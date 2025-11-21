const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminUserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  role: {
    type: String,
    enum: ['admin', 'super_admin'],
    default: 'admin'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser',
    default: null
  }
}, {
  timestamps: true
});

// Index for better performance
adminUserSchema.index({ email: 1 });
adminUserSchema.index({ username: 1 });

// Virtual for account locked status
adminUserSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
adminUserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
adminUserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Method to increment login attempts
adminUserSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: {
        lockUntil: 1
      },
      $set: {
        loginAttempts: 1
      }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
adminUserSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: {
      loginAttempts: 1,
      lockUntil: 1
    }
  });
};

// Method to update last login
adminUserSchema.methods.updateLastLogin = function() {
  return this.updateOne({
    $set: { lastLogin: new Date() }
  });
};

// Static method to find admin by email or username
adminUserSchema.statics.getAuthenticated = async function(username, password) {
  const admin = await this.findOne({
    $or: [
      { email: username },
      { username: username }
    ],
    isActive: true
  });

  if (!admin) {
    throw new Error('Invalid credentials');
  }

  // Check if account is locked
  if (admin.isLocked) {
    // Increment attempts if account is already locked
    await admin.incLoginAttempts();
    throw new Error('Account is locked due to too many failed login attempts');
  }

  // Test for a matching password
  const match = await admin.comparePassword(password);

  if (match) {
    // Update last login and reset attempts
    await admin.updateLastLogin();
    if (admin.loginAttempts > 0) {
      await admin.resetLoginAttempts();
    }
    return admin;
  }

  // Password is incorrect, increment login attempts
  await admin.incLoginAttempts();
  throw new Error('Invalid credentials');
};

// Static method to create default admin
adminUserSchema.statics.createDefaultAdmin = async function() {
  const existingAdmin = await this.findOne({ role: 'super_admin' });
  
  if (!existingAdmin) {
    const defaultAdmin = new this({
      username: 'admin',
      email: 'admin@theacj.com',
      password: 'admin123', // Should be changed immediately
      fullName: 'System Administrator',
      role: 'super_admin',
      isActive: true
    });
    
    await defaultAdmin.save();
    console.log('Default admin user created successfully');
    console.log('Username: admin');
    console.log('Email: admin@theacj.com');
    console.log('Password: admin123 (CHANGE THIS IMMEDIATELY!)');
    
    return defaultAdmin;
  }
  
  return existingAdmin;
};

// Remove password from JSON output
adminUserSchema.methods.toJSON = function() {
  const admin = this.toObject();
  delete admin.password;
  delete admin.resetPasswordToken;
  delete admin.resetPasswordExpire;
  delete admin.loginAttempts;
  delete admin.lockUntil;
  return admin;
};

module.exports = mongoose.model('AdminUser', adminUserSchema);