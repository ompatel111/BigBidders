const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// POST route to handle form submission
router.post('/submit', contactController.submitContactForm);

module.exports = router;
