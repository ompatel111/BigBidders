const User = require('../models/user');
const Category = require('../models/category');
const Product = require('../models/product');

exports.getPassword = (req, res) => {
    res.render('password');
}

exports.getProfile = (req, res) => {
    res.render('profile');
}



// exports.getDashboard = (req, res) => {
//     res.render('dashboard');
// }

exports.getSeller = async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const categoryCount = await Category.countDocuments();
        const productCount = await Product.countDocuments();

        res.render('seller_dashboard', { userCount, categoryCount, productCount });
    } catch (err) {
        console.error("Error fetching counts:", err);
        res.status(500).send("Error fetching counts");
    }
}
