const bcrypt = require('bcryptjs');
const User = require('../models/user');

exports.getUserCreatePage = (req, res) => {
    try {
        const errorMessage = false;
        const isEditMode = false;
        res.render('user_create', { errorMessage, isEditMode });
    } catch (error) {
        console.error('Error rendering user create page:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.createUser = async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      mobileno,
      email,
      password,
      role,
      address,
      Status,
    } = req.body;

    // Check if required fields are empty
    // if (
    //   !firstname ||
    //   !lastname ||
    //   !mobileno ||
    //   !email ||
    //   !password ||
    //   !role ||
    //   !Status
    // ) {
    //   return res.status(400).render('user_create', {
    //     errorMessage: 'All fields are required',
    //     isEditMode: false,
    //   });
    // }

    // Validate email format
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return res.status(400).render('user_create', {
        errorMessage: 'Invalid email format',
        isEditMode: false,
      });
    }

    // Check if password meets requirements
    if (
      password.length < 8 ||
      !/[a-z]/.test(password) ||
      !/[A-Z]/.test(password) ||
      !/\d/.test(password) ||
      !/[@$!%*?&]/.test(password)
    ) {
      return res.status(400).render('user_create', {
        errorMessage:
          'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        isEditMode: false,
      });
    }

    // Check if email is already registered
    const existingUserWithEmail = await User.findOne({ email });
    if (existingUserWithEmail) {
      return res.status(400).render('user_create', {
        errorMessage: 'Email is already registered',
        isEditMode: false,
      });
    }

    // Check if mobile number is already registered
    const existingUserWithMobile = await User.findOne({ mobileno });
    if (existingUserWithMobile) {
      return res.status(400).render('user_create', {
        errorMessage: 'Mobile number is already registered',
        isEditMode: false,
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new User instance
    const newUser = new User({
      firstname,
      lastname,
      mobileno,
      email,
      password: hashedPassword,
      is_seller: role === 'seller',
      is_admin: role === 'admin',
      address,
      status: Status === 'true', // Assuming Status is received as a string
      createdBy: 'Seller', // Assuming createdBy is always 'Seller' for now
    });

    // Save the user data to the database
    await newUser.save();

    // Redirect to a success page or send a success message
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Error saving user:', error);
    // Render an error page or send an error message
    res.status(500).send('Error saving user');
  }
};

exports.getAllUsers = async (req, res) => {
    try {
      const users = await User.find();
      res.render('users', { users: users });
    } catch (err) {
      console.error("Error fetching users:", err);
      res.status(500).send("Error fetching users");
    }
};

exports.viewUserDetails = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
  
        if (!user) {
            return res.status(404).send('User not found');
        }
  
        // Render the user details view with user data
        res.render('users_view', { user });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getBlockedUsers = async (req, res) => {
    try {
      const blockedUsers = await User.find({ status: false });
      res.render('users', { users: blockedUsers });
    } catch (err) {
      console.error("Error fetching blocked users:", err);
      res.status(500).send("Error fetching blocked users");
    }
};

exports.editUser = async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).send({ error: 'User not found' });
      }
      res.render('user_create', { isEditMode: true, user, errorMessage: null });
    } catch (error) {
      res.status(500).send({ error: 'Internal Server Error' });
    }
};

exports.updateUser = async (req, res) => {
    try {
      const { firstname, lastname, mobileno, email, address, role, approved, image } = req.body;
      const userId = req.params.id;
      
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      user.firstname = firstname;
      user.lastname = lastname;
      user.mobileno = mobileno;
      user.email = email;
      user.address = address;
      user.role = role;
      user.status = approved === 'true';
      
      await user.save();
  
      return res.redirect('/admin/users')
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error updating user' });
    }
};

exports.toggleUserStatus = async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).send({ error: 'User not found' });
      }
  
      user.status = !user.status;
  
      await User.updateOne({ _id: userId }, { $set: { status: user.status } });
  
      res.redirect('back');
    } catch (error) {
      console.error('Error toggling user status:', error);
      res.status(500).send({ error: 'Internal Server Error' });
    }
};
