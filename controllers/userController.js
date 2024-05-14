const bcrypt = require('bcryptjs');
const User = require('../models/user');
const upload = require('../middleware/upload');
exports.renderSignupForm = (req, res) => {
  res.render('signup', { errors: null });
};


exports.createUser = async (req, res) => {
  const { firstname, lastname, mobileno, email, password, cpassword, is_seller, address } = req.body;

  // Validation
  const errors = [];
  if (password !== cpassword) {
    errors.push({ msg: 'Passwords do not match' });
  }
  if (await User.findOne({ email })) {
    errors.push({ msg: 'User with this email already exists' });
  }
  if (!firstname.match(/^[a-zA-Z]+$/)) {
    errors.push({ msg: 'First name must contain only alphabets' });
  }
  if (!lastname.match(/^[a-zA-Z]+$/)) {
    errors.push({ msg: 'Last name must contain only alphabets' });
  }
  if (!/^\d{10}$/.test(mobileno)) {
    errors.push({ msg: 'Mobile number must be 10 digits' });
  }
  if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    errors.push({ msg: 'Invalid email address' });
  }
  if (password.length < 8 || !/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/.test(password)) {
    errors.push({ msg: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character' });
  }

  if (errors.length > 0) {
    return res.status(400).render('signup', { errors });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ firstname, lastname, mobileno, email, password: hashedPassword, is_seller, address });
    await newUser.save();

    res.status(201).redirect('/login');
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.loadUserDetails = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.render('profile', { user });
  } catch (error) {
    console.error('Error loading user details:', error);
    res.status(500).send('Error loading user details');
  }
};



exports.updateUserDetails = async (req, res) => {
  try {
      const userId = req.params.userId;
      const { firstname, lastname, mobileno, address } = req.body;
      
      // Update user details using findByIdAndUpdate
      const updatedUser = await User.findByIdAndUpdate(userId, {
          firstname: firstname,
          lastname: lastname,
          mobileno: mobileno,
          address: address,
      }, { new: true }); // { new: true } ensures that the updated document is returned

      if (!updatedUser) {
          return res.status(404).send('User not found');
      }

      // Handle image upload
      upload(req, res, async (err) => {
          if (err) {
              console.error('Error uploading image:', err);
              return res.status(500).send('Error uploading image');
          }
          if (req.file) {
              updatedUser.image = "/uploads/"+req.file.filename;
          }
          await updatedUser.save();
          res.redirect('/user-dashboard'); // Redirect to user profile page or any other appropriate page
      });
  } catch (error) {
      console.error('Error updating user details:', error);
      res.status(500).send('Error updating user details');
  }
};

exports.updatePassword = async (req, res) => {
  const { mobile, newPassword } = req.body;

  try {
    // Find user with the provided mobile number
    const user = await User.findOne({ mobileno: mobile });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate hash for the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password with the new hashed password
    user.password = hashedPassword;

    // Save the updated user object to the database
    await user.save();

    res.redirect('login');
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'An error occurred while updating the password' });
  }
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const { mobileno } = req.session.user; // Assuming you store the logged-in user's details in the session

  try {
    // Find user with the provided mobile number
    const user = await User.findOne({ mobileno });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the current password matches
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Check if new password and confirm password match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New password and confirm password do not match' });
    }

    // Generate hash for the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password with the new hashed password
    user.password = hashedPassword;

    // Save the updated user object to the database
    await user.save();

    res.redirect('login');
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'An error occurred while changing the password' });
  }
};

