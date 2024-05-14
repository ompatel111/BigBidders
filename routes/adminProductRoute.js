const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');




// Routes for auction management
router.get('/auctions', productController.getallAuctions);
router.get('/saller_auctions', productController.getSellerAuctions);
router.get('/rejected_auctions', productController.getRejectedAuctions); 
router.get('/pending_auctions', productController.getPendingAuctions);  
router.get('/new_auctions', productController.getNewAuctions);
router.get('/Open_auctions', productController.getOpenAuctions);
router.get('/closed_auctions', productController.getClosedAuctions);
router.get('/suspended_auctions', productController.getSuspendedAuctions);
router.get('/create-auction', productController.getCreateAuction);
router.get('/auction_view/:productId', productController.getAuctionViewById);
router.post('/create-auction', productController.createAuction);
router.get('/update-auction/:id?', productController.renderUpdateAuctionForm);
router.post('/update-auction/:id', productController.updateAuction);




module.exports = router;
