const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  mobileno: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  is_seller: {
    type: Boolean,
    default: false,
  },
  is_admin: {
    type: Boolean,
    default: false,
  },
  address: {
    type: String,
    default: null,
  },
  status: {
    type: Boolean,
    default: true,
  },
  image: {
    type: String,
    default: '/public/uploads/users/thumbnail/default.png', 
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;