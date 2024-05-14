const bcrypt = require('bcryptjs');
const User = require('../models/user');
const express = require('express');
const app = express();

exports.renderLoginForm = (req, res) => {
  const { errorMessage } = req.session;
  req.session.errorMessage = null;
  res.render('login', { errorMessage });
};

exports.loginUser = async (req, res) => {
  const { mobileno, password } = req.body;

  try {
    const user = await User.findOne({ mobileno });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      req.session.errorMessage = 'Incorrect mobile number or password';
      return res.redirect('/login');
    }

    // Check if user status is true
    if (!user.status) {
      req.session.errorMessage = 'Your access has been revoked';
      return res.redirect('/login');
    }

    // Store user data in session
    req.session.user = {
      _id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      mobileno: user.mobileno,
      email: user.email,
      is_seller: user.is_seller,
      is_admin: user.is_admin,
      address: user.address
    };

    if (user.is_admin) {
      res.redirect('/admin/dashboard');
    } else if (user.is_seller) {
      res.redirect('/seller/dashboard');
    } else {
      res.redirect('/');
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.logoutUser = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      res.status(500).send('Server error');
    } else {
      res.redirect('/login');
    }
  });
};
