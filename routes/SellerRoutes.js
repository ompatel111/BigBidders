const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');


// Admin routes
router.get('/password', sellerController.getPassword);
router.get('/profile', sellerController.getProfile);


router.get('/dashboard', sellerController.getSeller);


module.exports = router;
