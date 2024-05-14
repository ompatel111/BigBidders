const mongoose = require('mongoose');

// Define the schema
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  image: {
    type: String,
    default: '' // Default image if not provided
  }
});

// Middleware to convert the category name to lowercase before saving
categorySchema.pre('save', function(next) {
  this.name = this.name.toLowerCase();
  next();
});

module.exports = mongoose.model('Category', categorySchema);
