// Import necessary modules
const express = require('express');
const router = express.Router();
const Bid = require('../models/bid');

// Define route to fetch the latest bid for a specific product
router.get('/latest/:productId', async (req, res) => {
  try {
    // Find the latest bid for the specified product
    const latestBid = await Bid.findOne({ product: req.params.productId })
                                .sort({ createdAt: -1 })
                                .limit(1);

    // Send the latest bid data as a JSON response
    res.json(latestBid);
  } catch (error) {
    // Handle errors
    console.error('Error fetching latest bid:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Export the router
module.exports = router;
