const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
// Endpoint to handle product search
router.get('/search', async (req, res) => {
    try {
        const searchQuery = req.query.q;
        const products = await Product.find({ name: { $regex: searchQuery, $options: 'i' } });
        res.json(products);
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// Routes for browsing products
router.get('/browse-bid', productController.browseProducts);
router.get('/:productId', productController.viewProductDetail);

module.exports = router;