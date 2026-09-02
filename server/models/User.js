const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Please provide a full name'], 
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, 'Please provide an email address'], 
    unique: true, 
    lowercase: true,
    trim: true 
  },
  phone: { 
    type: String, 
    required: [true, 'Please provide a mobile phone number'],
    trim: true
  },
  password: { 
    type: String, 
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  role: { 
    type: String, 
    enum: ['farmer', 'buyer', 'admin'], 
    default: 'buyer' 
  },
  location: {
    address: { type: String, default: '' },
    village: { type: String, default: '' },
    district: { type: String, required: [true, 'District is required'] },
    state: { type: String, required: [true, 'State is required'] },
    pincode: { type: String, required: [true, 'Pincode is required'] }
  },
  farmDetails: {
    farmName: { type: String, default: '' },
    farmSizeAcres: { type: Number, default: 0 },
    fpoName: { type: String, default: '' },
    primaryCrops: [{ type: String }]
  },
  buyerDetails: {
    businessName: { type: String, default: '' },
    buyerType: { 
      type: String, 
      enum: ['retailer', 'wholesaler', 'restaurant', 'consumer', 'fpo', 'other'],
      default: 'retailer'
    },
    gstin: { type: String, default: '' }
  },
  isVerified: { 
    type: Boolean, 
    default: true 
  },
  trustScore: {
    type: Number,
    default: 4.8,
    min: 1.0,
    max: 5.0
  },
  avatar: {
    type: String,
    default: ''
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Hash password before saving if modified
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password helper
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
