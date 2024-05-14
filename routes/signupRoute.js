const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Routes for user signup
router.get('/signup', userController.renderSignupForm);
router.post('/signupUser', userController.createUser);

router.post('/updatePassword', userController.updatePassword);
router.post('/changePassword', userController.changePassword);

module.exports = router;
