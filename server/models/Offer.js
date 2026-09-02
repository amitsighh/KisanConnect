const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  listing: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Listing', 
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
  offeredPricePerUnit: { 
    type: Number, 
    required: [true, 'Offered price per unit is required'],
    min: 1
  },
  offeredQuantity: { 
    type: Number, 
    required: [true, 'Offered quantity is required'],
    min: 1
  },
  unit: {
    type: String,
    default: 'quintal'
  },
  totalOfferedAmount: { 
    type: Number, 
    required: true 
  },
  originalListingPrice: {
    type: Number,
    required: true
  },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected', 'countered', 'converted_to_order', 'cancelled'], 
    default: 'pending' 
  },
  lastActionBy: {
    type: String,
    enum: ['buyer', 'farmer'],
    default: 'buyer'
  },
  currentAgreedPrice: {
    type: Number
  },
  currentAgreedQuantity: {
    type: Number
  },
  messages: [
    {
      senderRole: { 
        type: String, 
        enum: ['buyer', 'farmer'], 
        required: true 
      },
      senderName: {
        type: String,
        default: ''
      },
      message: { 
        type: String, 
        default: '' 
      },
      actionType: { 
        type: String, 
        enum: ['initial_offer', 'counter_offer', 'accept', 'reject', 'chat'], 
        default: 'initial_offer' 
      },
      counterPrice: Number,
      counterQuantity: Number,
      createdAt: { 
        type: Date, 
        default: Date.now 
      }
    }
  ],
  convertedOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
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

offerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Offer', offerSchema);
