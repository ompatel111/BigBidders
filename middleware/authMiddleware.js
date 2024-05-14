// authMiddleware.js

// Middleware to authenticate admin
exports.authenticateAdmin = (req, res, next) => {
    const user = req.session.user;
    if (user && user.is_admin && !user.is_seller) {
      next();
    } else {
      res.status(403).send('Access Denied for admin.');
    }
  };
  
  // Middleware to authenticate seller
  exports.authenticateSeller = (req, res, next) => {
    const user = req.session.user;
    if (user && user.is_seller && !user.is_admin) {
      next();
    } else {
      res.status(403).send('Access Denied for seller.');
    }
  };
  
  // Middleware to authenticate user
  exports.authenticateUser = (req, res, next) => {
    const user = req.session.user;
    if (user && !user.is_admin && !user.is_seller) {
      next();
    } else {
      res.status(403).send('Access Denied for user.');
    }
  };
  