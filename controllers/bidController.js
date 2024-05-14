const mongoose = require('mongoose');
const Bid = require('../models/bid');
const Product = require('../models/product');
const User = require('../models/user');

async function getBidData(productId, userId) {
    const existingBid = await Bid.findOne({ user: userId, product: productId });
    const userHasBid = existingBid !== null;
    const userBidAmount = existingBid ? existingBid.amount : null;
    const loggedInUser = !!userId;
    const bids = await Bid.find({ product: productId });
    const product = await Product.findById(productId);

    const userIds = bids.map(bid => bid.user);
    const users = await User.find({ _id: { $in: userIds } }, 'firstname lastname');
    const userMap = users.reduce((acc, user) => {
        acc[user._id] = `${user.firstname} ${user.lastname}`;
        return acc;
    }, {});

    // Fetch similar products from the same category
    const similarProducts = await Product.find({ category: product.category, _id: { $ne: product._id } })
        .limit(5)
        .lean();

    return { existingBid, userHasBid, userBidAmount, loggedInUser, bids, product, userMap, similarProducts };
}

// Function to submit a bid
exports.submitBid = async (req, res) => {
    try {
        const { productId } = req.params;
        const { bidAmount } = req.body;
        const userId = req.session.user ? req.session.user._id : null;

        const { existingBid, userHasBid, userBidAmount, loggedInUser, bids, product, userMap, similarProducts } = await getBidData(productId, userId);

        const minBidAmount = product.startingPrice + 1;
        if (!bidAmount || bidAmount < minBidAmount) {
            const errorMessage = `Bid amount must be at least ${minBidAmount}`;
            return res.render('bid-detail', { errorMessage, product, bids, loggedInUser, userHasBid, userBidAmount, userMap, similarProducts });
        }

        if (existingBid) {
            existingBid.amount = bidAmount;
            await existingBid.save();
        } else {
            const bid = new Bid({ user: userId, product: productId, amount: bidAmount });
            await bid.save();
        }

        res.redirect('/my-auctions');
    } catch (err) {
        console.error('Error submitting bid:', err);
        res.status(500).send('Server error');
    }
};

// Function to modify a bid
exports.modifyBid = async (req, res) => {
    try {
        const { productId } = req.params;
        const { bidAmount } = req.body;
        const userId = req.session.user ? req.session.user._id : null;

        const { existingBid, userHasBid, userBidAmount, loggedInUser, bids, product, userMap, similarProducts } = await getBidData(productId, userId);

        const minBidAmount = product.startingPrice + 1;
        if (!bidAmount || bidAmount < minBidAmount) {
            const errorMessage = `Bid amount must be at least ${minBidAmount}`;
            return res.render('bid-detail', { errorMessage, product, bids, loggedInUser, userHasBid, userBidAmount, userMap, similarProducts });
        }

        if (!existingBid) {
            return res.status(404).send('Bid not found');
        }

        existingBid.amount = bidAmount;
        await existingBid.save();

        res.redirect('/my-auctions');
    } catch (err) {
        console.error('Error modifying bid:', err);
        res.status(500).send('Server error');
    }
};

