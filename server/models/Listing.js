const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  farmer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  cropName: { 
    type: String, 
    required: [true, 'Crop name is required'], 
    trim: true 
  },
  category: { 
    type: String, 
    required: [true, 'Category is required'],
    enum: [
      'Cereals & Grains', 
      'Pulses', 
      'Vegetables', 
      'Fruits', 
      'Spices', 
      'Oilseeds', 
      'Other'
    ]
  },
  variety: { 
    type: String, 
    default: 'Standard / Desi' 
  },
  quantity: { 
    type: Number, 
    required: [true, 'Available quantity is required'], 
    min: [0, 'Quantity cannot be negative'] 
  },
  minOrderQuantity: {
    type: Number,
    default: 1,
    min: 1
  },
  unit: { 
    type: String, 
    enum: ['kg', 'quintal', 'ton'], 
    default: 'quintal' 
  },
  pricePerUnit: { 
    type: Number, 
    required: [true, 'Price per unit in INR is required'], 
    min: [1, 'Price must be at least ₹1'] 
  },
  qualityGrade: { 
    type: String, 
    enum: [
      'Grade A (Premium)', 
      'Grade B (Standard)', 
      'Grade C (Fair)'
    ], 
    default: 'Grade A (Premium)' 
  },
  location: {
    village: { type: String, default: '' },
    district: { type: String, required: [true, 'District is required'] },
    state: { type: String, required: [true, 'State is required'] },
    pincode: { type: String, required: [true, 'Pincode is required'] }
  },
  harvestDate: { 
    type: Date, 
    default: Date.now 
  },
  images: [{ 
    type: String 
  }],
  description: { 
    type: String, 
    default: '' 
  },
  isOrganic: {
    type: Boolean,
    default: false
  },
  status: { 
    type: String, 
    enum: ['active', 'sold_out', 'inactive'], 
    default: 'active' 
  },
  viewsCount: {
    type: Number,
    default: 0
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update timestamp on save
listingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Text index for fast multi-field search
listingSchema.index({ cropName: 'text', variety: 'text', description: 'text', 'location.district': 'text' });

module.exports = mongoose.model('Listing', listingSchema);
