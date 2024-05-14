const Product = require('../models/product');
const Bid = require('../models/bid');
const Category = require('../models/category');
const mongoose = require('mongoose');


exports.getallAuctions = async (req, res) => {
    try {
        const products = await Product.find({ adminStatus: { $ne: 'rejected' } }).exec();
        res.render('auction', { products: products });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getAuctions = async (req, res) => {
    try {
        const products = await Product.find({ adminStatus: { $ne: 'rejected' } }).exec();
        res.render('auction', { products });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getPendingAuctions = async (req, res) => {
    try {
        const pendingAuctions = await Product.find({ adminStatus: 'pending' }).exec();
        res.render('auction', { products: pendingAuctions });
    } catch (error) {
        console.error('Error fetching pending auctions:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getRejectedAuctions = async (req, res) => {
    try {
        const rejectedAuctions = await Product.find({ adminStatus: 'rejected' }).exec();
        res.render('auction', { products: rejectedAuctions });
    } catch (error) {
        console.error('Error fetching rejected auctions:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getSellerAuctions = async (req, res) => {
    try {
        const products = await Product.find({ createdBy: { $ne: 'Admin' } }).exec();
        res.render('auction', { products });
    } catch (error) {
        console.error('Error fetching seller auctions:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.viewAuction = async (req, res) => {
    try {
        const productId = req.params.productId;
        const product = await Product.findById(productId).lean();
        if (!product) {
            return res.status(404).send('Product not found');
        }
        product.shippingAvailable = product.shippingAvailable ? 'Yes' : 'No';
        const bids = await Bid.find({ product: productId }).populate('user').lean();
        delete product.__v;
        res.render('auction_view', { product, bids });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getNewAuctions = async (req, res) => {
    const { status } = req.query;
    try {
        const auctions = await Product.find({ auctionStatus: 'new' }).exec();
        res.render('auction', { products: auctions });
    } catch (error) {
        console.error(`Error fetching ${status} auctions:`, error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getOpenAuctions = async (req, res) => {
    const { status } = req.query;
    try {
        const auctions = await Product.find({ auctionStatus: 'open' }).exec();
        res.render('auction', { products: auctions });
    } catch (error) {
        console.error(`Error fetching ${status} auctions:`, error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getClosedAuctions = async (req, res) => {
    const { status } = req.query;
    try {
        const auctions = await Product.find({ auctionStatus: 'closed' }).exec();
        res.render('auction', { products: auctions });
    } catch (error) {
        console.error(`Error fetching ${status} auctions:`, error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getSuspendedAuctions = async (req, res) => {
    const { status } = req.query;
    try {
        const auctions = await Product.find({ auctionStatus: 'suspended' }).exec();
        res.render('auction', { products: auctions });
    } catch (error) {
        console.error(`Error fetching ${status} auctions:`, error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getCreateAuction = async (req, res) => {
    try {
        const categories = await Category.find({ status: 'active' });
        res.render('create', { editMode: false, categories, errorMessage: false });
    } catch (error) {
        console.error('Error rendering create view:', error);
        res.status(500).send('Internal Server Error');
    }
};
const multer = require('multer');
const upload = require('../middleware/upload'); // Import the upload middleware
exports.createAuction = async (req, res) => {
    try {
        const editMode = false;
        const categories = await Category.find({ status: 'active' });
        
        // Call the upload middleware to handle file upload
        upload(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                // Handle Multer errors
                console.error('Multer error:', err);
                return res.status(500).send('Error uploading image');
            } else if (err) {
                // Handle other errors
                console.error('Error uploading image:', err);
                return res.status(500).send('Error uploading image');
            }

            // Continue with processing the form data after the image has been uploaded
            const { title, category_id, condition, description, start_date, end_date, reserve_price, auction_status, admin_status } = req.body;

            // Validate form data
            if (!title || !category_id || !condition || !description || !start_date || !end_date || !reserve_price) {
                const errorMessage = 'All details must be provided.';
                return res.render('create', { errorMessage, editMode, categories });
            }

            if (!/[a-zA-Z]/.test(title)) {
                const errorMessage = 'Product name must include characters.';
                return res.render('create', { errorMessage, editMode, categories });
            }

            const startDate = new Date(start_date);
            const endDate = new Date(end_date);
            const currentDate = new Date();

            if (startDate <= currentDate) {
                const errorMessage = 'Start date should be after the current date and time.';
                return res.render('create', { errorMessage, editMode, categories });
            }

            if (endDate <= startDate) {
                const errorMessage = 'End date must be after start date.';
                return res.render('create', { errorMessage, editMode, categories });
            }

            // Validate reserve price
            const reservePrice = parseFloat(reserve_price);
            if (isNaN(reservePrice) || reservePrice <= 0) {
                const errorMessage = 'Reserve price must be a positive number.';
                return res.render('create', { errorMessage, editMode, categories });
            }

            // Create a new Product instance with the form data and uploaded image path
            const newProduct = new Product({
                name: title,
                category: category_id,
                condition: condition,
                image: req.file ? `/uploads/${req.file.filename}` : "no_image", // Use the uploaded image path if available, otherwise set a default value
                description: description,
                biddingStartTime: start_date,
                biddingEndTime: end_date,
                startingPrice: reservePrice,
                shippingAvailable: req.body.Shipping === "1",
                termsAndConditions: req.body.shipping_terms,
                auctionStatus: auction_status,
                adminStatus: admin_status,
                createdBy: "Admin",
                createdByUserId: req.session.user._id, // Store the ID of the logged-in user who creates the product
                createdAt: new Date(), // Store the current date and time
                lastUpdatedBy: {
                    username: "admin",
                    updatedAt: new Date()
                }
            });

            // Save the new product to the database
            await newProduct.save();
            console.log('Product saved successfully');
            res.redirect('/admin/auctions');
        });
    } catch (error) {
        console.error('Error saving product:', error);
        res.status(500).send('Error saving product');
    }
};

// exports.createAuction = async (req, res) => {
//     try {
//         const editMode = false;
//         const categories = await Category.find({ status: 'active' });
        
//         // Call the upload middleware to handle file upload
//         upload(req, res, async function (err) {
//             if (err instanceof multer.MulterError) {
//                 // Handle Multer errors
//                 console.error('Multer error:', err);
//                 return res.status(500).send('Error uploading image');
//             } else if (err) {
//                 // Handle other errors
//                 console.error('Error uploading image:', err);
//                 return res.status(500).send('Error uploading image');
//             }

//             // Continue with processing the form data after the image has been uploaded
//             const { title, category_id, condition, description, start_date, end_date, reserve_price, auction_status, admin_status } = req.body;

//             // Validate form data
//             if (!title || !category_id || !condition || !description || !start_date || !end_date || !reserve_price || !auction_status || !admin_status) {
//                 const errorMessage = 'All details must be provided.';
//                 return res.render('create', { errorMessage, editMode, categories });
//             }

//             if (!/[a-zA-Z]/.test(title)) {
//                 const errorMessage = 'Product name must include characters.';
//                 return res.render('create', { errorMessage, editMode, categories });
//             }

//             const startDate = new Date(start_date);
//             const endDate = new Date(end_date);
//             const dayAfterTomorrow = new Date();
//             dayAfterTomorrow.setDate(dayAfterTomorrow.getDate());

//             if (startDate <= dayAfterTomorrow) {
//                 const errorMessage = 'Start date should be not less then current date and time.';
//                 return res.render('create', { errorMessage, editMode, categories });
//             }

//             if (endDate <= startDate) {
//                 const errorMessage = 'End date must be after start date.';
//                 return res.render('create', { errorMessage, editMode, categories });
//             }

//             // Create a new Product instance with the form data and uploaded image path
//             const newProduct = new Product({
//                 name: title,
//                 category: category_id,
//                 condition: condition,
//                 image: req.file ? `/uploads/${req.file.filename}` : "no_image", // Use the uploaded image path if available, otherwise set a default value
//                 description: description,
//                 biddingStartTime: start_date,
//                 biddingEndTime: end_date,
//                 startingPrice: reserve_price,
//                 shippingAvailable: req.body.Shipping === "1",
//                 termsAndConditions: req.body.shipping_terms,
//                 auctionStatus: auction_status,
//                 adminStatus: admin_status,
//                 createdBy: "Admin",
//                 createdByUserId: req.session.user._id, // Store the ID of the logged-in user who creates the product
//                 createdAt: new Date(), // Store the current date and time
//                 lastUpdatedBy: {
//                     username: "admin",
//                     updatedAt: new Date()
//                 }
//             });

//             // Save the new product to the database
//             await newProduct.save();
//             console.log('Product saved successfully');
//             res.redirect('/admin/auctions');
//         });
//     } catch (error) {
//         console.error('Error saving product:', error);
//         res.status(500).send('Error saving product');
//     }
// };



exports.renderUpdateAuctionForm = async (req, res) => {
    try {
        let editMode = false;
        let product = {};
        let errorMessage = false;
        const categories = await Category.find({ status: 'active' });

        if (req.params.id) {
            editMode = true;
            product = await Product.findById(req.params.id);
            if (!product) {
                return res.status(404).send('Product not found');
            }
        }

        res.render('create', { editMode, product, errorMessage, categories });
    } catch (error) {
        console.error('Error rendering product form:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Function to handle image upload
exports.updateImage = (req, res, next) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.error('Multer error:', err);
            return res.status(500).send('Error uploading image');
        } else if (err) {
            console.error('Error uploading image:', err);
            return res.status(500).send('Error uploading image');
        }
        next(); // Call the next middleware (updateFields) after file upload completes
    });
};

// Function to update other fields
// Function to update other fields
// Function to update other fields
// exports.updateFields = async (req, res) => {
//     try {
//         const productId = req.params.id;
//         const { title, category_id, condition, start_date, end_date, reserve_price, description, auction_status, admin_status } = req.body;

//         // Retrieve the product details from the database
//         const product = await Product.findById(productId);

//         if (!product) {
//             return res.status(404).send('Product not found');
//         }

//         const biddingStartTime = start_date || product.biddingStartTime;
//         const biddingEndTime = end_date || product.biddingEndTime;

//         // Update the auction details
//         const updatedFields = {
//             name: title,
//             category: category_id,
//             condition: condition,
//             description: description,
//             biddingStartTime: biddingStartTime,
//             biddingEndTime: biddingEndTime,
//             startingPrice: reserve_price,
//             shippingAvailable: req.body.Shipping === "1",
//             termsAndConditions: req.body.shipping_terms,
//             auctionStatus: auction_status,
//             adminStatus: admin_status,
//             lastUpdatedBy: {
//                 username: "admin",
//                 updatedAt: new Date()
//             }
//         };

//         // Update the image field if a new image is uploaded
//         if (req.file) {
//             updatedFields.image = '/uploads/' + req.file.filename; // Save the image file name with '/uploads/' prefix
//         }

//         // Update the product in the database
//         const updatedProduct = await Product.findByIdAndUpdate(productId, updatedFields, { new: true });

//         console.log('Product updated successfully:', updatedProduct);
//         res.redirect('/admin/auctions');
//     } catch (error) {
//         console.error('Error updating auction:', error);
//         res.status(500).send('Internal Server Error');
//     }
// };
exports.updateFields = async (req, res) => {
    try {
        const productId = req.params.id;
        const { title, category_id, condition, start_date, end_date, reserve_price, description, auction_status, admin_status } = req.body;

        // Retrieve the product details from the database
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).send('Product not found');
        }

        const biddingStartTime = start_date || product.biddingStartTime;
        const biddingEndTime = end_date || product.biddingEndTime;

        // Validate reserve price
        const updatedReservePrice = parseFloat(reserve_price);
        if (isNaN(updatedReservePrice) || updatedReservePrice <= 0) {
            return res.status(400).send('Reserve price must be a positive number.');
        }

        // Update the auction details
        const updatedFields = {
            name: title,
            category: category_id,
            condition: condition,
            description: description,
            biddingStartTime: biddingStartTime,
            biddingEndTime: biddingEndTime,
            startingPrice: updatedReservePrice,
            shippingAvailable: req.body.Shipping === "1",
            termsAndConditions: req.body.shipping_terms,
            auctionStatus: auction_status,
            adminStatus: admin_status,
            lastUpdatedBy: {
                username: "admin",
                updatedAt: new Date()
            }
        };

        // Update the image field if a new image is uploaded
        if (req.file) {
            updatedFields.image = '/uploads/' + req.file.filename; // Save the image file name with '/uploads/' prefix
        }

        // Update the product in the database
        const updatedProduct = await Product.findByIdAndUpdate(productId, updatedFields, { new: true });

        console.log('Product updated successfully:', updatedProduct);
        res.redirect('/admin/auctions');
    } catch (error) {
        console.error('Error updating auction:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Function to update both image and fields
exports.updateAuction = async (req, res) => {
    try {
        // Call updateImage middleware to handle image upload
        exports.updateImage(req, res, async function(err) {
            if (err) {
                console.error('Error updating image:', err);
                return res.status(500).send('Error updating image');
            }
            // Once image is uploaded, call updateFields to update other fields
            exports.updateFields(req, res);
        });
    } catch (error) {
        console.error('Error updating auction:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.browseProducts = async (req, res) => {
    try {
        let products;
        const category = req.query.category;
        const searchQuery = req.query.search;

        // Fetch active categories from the database
        const activeCategories = await Category.find({ status: 'active' }).lean();

        // Fetch product counts for each category with approved admin status and open auction status
        const categoryCounts = await Promise.all(activeCategories.map(async (category) => {
            const count = await Product.countDocuments({ category: category.name, adminStatus: 'approved', auctionStatus: 'open' });
            return { ...category, productCount: count };
        }));

        // Fetch products with approved admin status and open auction status
        if (category) {
            products = await Product.find({ category: category, adminStatus: 'approved', auctionStatus: 'open' });
        } else if (searchQuery) {
            products = await Product.find({ $text: { $search: searchQuery }, adminStatus: 'approved', auctionStatus: 'open' });
        } else {
            products = await Product.find({ adminStatus: 'approved', auctionStatus: 'open' });
        }

        res.render('browse-bid', { products, category, searchQuery, user: req.session.user, categories: categoryCounts });
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).send('Server error');
    }
};





const User = require('../models/user');

exports.viewProductDetail = async (req, res) => {
    try {
        const productId = req.params.productId;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).send('Invalid product ID');
        }

        const loggedInUser = req.session.user;

        if (!loggedInUser) {
            // If user is not logged in, redirect to the login page
            return res.redirect('/login');
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).send('Product not found');
        }

        // Fetch bids associated with the product
        const bids = await Bid.find({ product: productId }).lean();

        // Check if the logged-in user has already placed a bid for this product
        const userHasBid = bids.some(bid => bid.user.toString() === loggedInUser._id.toString());

        // Calculate the user's bid amount if they have placed a bid
        let userBidAmount = null;
        if (userHasBid) {
            const userBid = bids.find(bid => bid.user.toString() === loggedInUser._id.toString());
            userBidAmount = userBid.amount;
        }

        // Fetch user names for all user IDs associated with bids
        const userIds = bids.map(bid => bid.user);
        const users = await User.find({ _id: { $in: userIds } }, 'firstname lastname');
        const userMap = {};
        users.forEach(user => {
            userMap[user._id] = `${user.firstname} ${user.lastname}`;
        });

        // Fetch similar products from the same category
        const similarProducts = await Product.find({ category: product.category, _id: { $ne: product._id } })
            .limit(5)
            .lean();

        res.render('bid-detail', { product, loggedInUser, bids, userHasBid, userBidAmount, similarProducts, userMap ,errorMessage:false});
    } catch (err) {
        console.error('Error fetching product:', err);
        res.redirect('/login'); // Redirect to login page on error
    }
};



exports.getAuctionViewById = async (req, res) => {
    try {
        const productId = req.params.productId;
        const product = await Product.findById(productId).lean();

        if (!product) {
            return res.status(404).send('Product not found');
        }

        product.shippingAvailable = product.shippingAvailable ? 'Yes' : 'No';
        const bids = await Bid.find({ product: productId }).populate('user').lean();

        // Check if the user is logged in
        if (!req.session.user) {
            return res.redirect('/login'); // Redirect to login page if not logged in
        }

        delete product.__v;
        res.render('auction_view', { product, bids });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).send('Internal Server Error');
    }
};


