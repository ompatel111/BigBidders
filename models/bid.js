const mongoose = require('mongoose');

const BidSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  win: {
    type: Boolean,
    default: false // Default value is false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  paymentTransactionId: {
    type: String,
    default: '' // Default value is an empty string
  }
});

module.exports = mongoose.model('Bid', BidSchema);
