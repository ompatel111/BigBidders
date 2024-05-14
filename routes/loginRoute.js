const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/login', authController.renderLoginForm);
router.post('/loginUser', authController.loginUser);
router.get('/logout', authController.logoutUser);

module.exports = router;

