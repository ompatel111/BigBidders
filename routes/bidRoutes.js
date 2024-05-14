const express = require('express');
const router = express.Router();
const bidController = require('../controllers/bidController');

// Route for submitting a bid
router.post('/:productId', bidController.submitBid);

// Route for modifying a bid
router.post('/:productId', bidController.modifyBid);

const Bid = require('../models/bid');

// Endpoint to fetch the latest bid for a specific product
router.get('/bid/latest/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;

    // Fetch the latest bid for the specified product
    const latestBid = await Bid.findOne({ product: productId }).sort({ createdAt: -1 }).limit(1);

    // Check if a bid is found
    if (!latestBid) {
      return res.status(404).json({ error: 'No bids found for the product' });
    }

    // Return the latest bid data as JSON response
    res.json({ amount: latestBid.amount });

  } catch (error) {
    console.error('Error fetching latest bid:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
