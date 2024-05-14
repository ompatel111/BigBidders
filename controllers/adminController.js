const User = require('../models/user');
const Category = require('../models/category');
const Product = require('../models/product');
const { Contact, InterestedPerson } = require('../models/contact');

exports.getPassword = (req, res) => {
    res.render('password');
}

exports.getProfile = (req, res) => {
    res.render('profile');
}



// exports.getDashboard = (req, res) => {
//     res.render('dashboard');
// }

exports.getAdmin = async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const categoryCount = await Category.countDocuments();
        const allAuctionsCount = await Product.countDocuments();
        const pendingAuctionsCount = await Product.countDocuments({ adminStatus: 'pending' });
        const rejectedAuctionsCount = await Product.countDocuments({ adminStatus: 'rejected' });
        const newAuctionsCount = await Product.countDocuments({ auctionStatus: 'new' });
        const openAuctionsCount = await Product.countDocuments({ auctionStatus: 'open' });
        const closedAuctionsCount = await Product.countDocuments({ auctionStatus: 'closed' });
        const suspendedAuctionsCount = await Product.countDocuments({ auctionStatus: 'suspended' });

        res.render('admin_dashboard', {
            userCount, categoryCount, 
            allAuctionsCount, 
            pendingAuctionsCount, 
            rejectedAuctionsCount,
            newAuctionsCount,
            openAuctionsCount,
            closedAuctionsCount,
            suspendedAuctionsCount
        });
    } catch (err) {
        console.error("Error fetching counts:", err);
        res.status(500).send("Error fetching counts");
    }
}


exports.showDetails = async (req, res) => {
    try {
        // Fetch contacts
        const contacts = await Contact.find();

        // Fetch interested people
        const interestedPeople = await InterestedPerson.find();

        // Render the page with contact and interested people details
        res.render('contact_details', { contacts, interestedPeople });
    } catch (error) {
        console.error('Error fetching contact and interested people details:', error);
        res.status(500).send('Internal Server Error');
    }
};