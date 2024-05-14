// middleware/checkAuth.js

const checkAuth = (req, res, next) => {
    // Check if user is logged in
    if (req.session.user) {
      // User is logged in, proceed to the next middleware
      next();
    } else {
      // User is not logged in, redirect to the login page
      res.redirect('/login');
    }
  };
  
  module.exports = checkAuth;
  