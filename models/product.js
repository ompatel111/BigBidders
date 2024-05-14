const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    condition: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: "no_image"
    },
    description: {
        type: String,
        required: true
    },
    biddingStartTime: {
        type: Date,
        required: true,
        default: Date.now // Default value set to current date/time
    },
    biddingEndTime: {
        type: Date,
        required: true
    },
    startingPrice: {
        type: Number,
        required: true
    },
    shippingAvailable: {
        type: Boolean,
        default: false // Default value set to false
    },
    termsAndConditions: {
        type: String,
        required: true
    },
    auctionStatus: {
        type: String,
        default: 'New'
    },
    adminStatus: {
        type: String,
        default: 'pending'
    },
    createdBy: {
        type: String,
        default: 'Seller'
    },
    createdByUserId: {
        type: mongoose.Schema.Types.ObjectId, // Store user ID
        ref: 'User', // Reference to the User model
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now // Store creation time
    },
    lastUpdatedBy: {
        username: {
            type: String,
            default: 'No updates'
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }
});

module.exports = mongoose.model('Product', productSchema);
