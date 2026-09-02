const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { 
    type: String, 
    unique: true, 
    required: true 
  },
  buyer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  farmer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  listing: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Listing', 
    required: true 
  },
  cropName: { 
    type: String, 
    required: true 
  },
  variety: {
    type: String,
    default: ''
  },
  qualityGrade: {
    type: String,
    default: 'Grade A (Premium)'
  },
  quantity: { 
    type: Number, 
    required: true,
    min: 1 
  },
  unit: { 
    type: String, 
    required: true 
  },
  pricePerUnit: { 
    type: Number, 
    required: true 
  },
  totalAmount: { 
    type: Number, 
    required: true 
  },
  fromOffer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Offer', 
    default: null 
  },
  deliveryAddress: {
    street: { type: String, required: [true, 'Street address is required'] },
    city: { type: String, required: [true, 'City/District is required'] },
    state: { type: String, required: [true, 'State is required'] },
    pincode: { type: String, required: [true, 'Pincode is required'] },
    contactPhone: { type: String, required: [true, 'Contact phone is required'] },
    receiverName: { type: String, default: '' }
  },
  paymentMethod: { 
    type: String, 
    enum: [
      'Direct Settlement / UPI on Delivery', 
      'Cash on Delivery', 
      'Bank Transfer on Verification'
    ],
    default: 'Direct Settlement / UPI on Delivery'
  },
  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Completed', 'Refunded'], 
    default: 'Pending' 
  },
  orderStatus: { 
    type: String, 
    enum: ['Placed', 'Confirmed', 'Dispatched', 'Delivered', 'Cancelled'], 
    default: 'Placed' 
  },
  timeline: [
    {
      status: { type: String, required: true },
      note: { type: String, default: '' },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  notes: {
    type: String,
    default: ''
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

orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', orderSchema);
