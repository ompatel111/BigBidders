const Product = require('../models/product');
const Bid = require('../models/bid');
const Category = require('../models/category');


exports.getallAuctions = async (req, res) => {
    try {
        const user = req.session.user;
        const products = await Product.find({ createdByUserId: user._id, adminStatus: { $ne: 'rejected' } }).exec();
        res.render('seller_auction', { products: products });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getAuctions = async (req, res) => {
    try {
        const user = req.session.user;
        const products = await Product.find({ createdByUserId: user._id, adminStatus: { $ne: 'rejected' } });
        res.render('seller_auction', { products });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getPendingAuctions = async (req, res) => {
    try {
        const user = req.session.user;
        const pendingAuctions = await Product.find({ createdByUserId: user._id, adminStatus: 'pending' });
        res.render('seller_auction', { products: pendingAuctions });
    } catch (error) {
        console.error('Error fetching pending auctions:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getRejectedAuctions = async (req, res) => {
    try {
        const user = req.session.user;
        const rejectedAuctions = await Product.find({ createdByUserId: user._id, adminStatus: 'rejected' });
        res.render('seller_auction', { products: rejectedAuctions });
    } catch (error) {
        console.error('Error fetching rejected auctions:', error);
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
        res.render('seller_auction_view', { product, bids });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getNewAuctions = async (req, res) => {
    try {
        const user = req.session.user;
        const auctions = await Product.find({ createdByUserId: user._id, auctionStatus: 'new' });
        res.render('seller_auction', { products: auctions });
    } catch (error) {
        console.error('Error fetching new auctions:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getOpenAuctions = async (req, res) => {
    try {
        const user = req.session.user;
        const auctions = await Product.find({ createdByUserId: user._id, auctionStatus: 'open' });
        res.render('seller_auction', { products: auctions });
    } catch (error) {
        console.error('Error fetching open auctions:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getClosedAuctions = async (req, res) => {
    try {
        const user = req.session.user;
        const auctions = await Product.find({ createdByUserId: user._id, auctionStatus: 'closed' });
        res.render('seller_auction', { products: auctions });
    } catch (error) {
        console.error('Error fetching closed auctions:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getSuspendedAuctions = async (req, res) => {
    try {
        const user = req.session.user;
        const auctions = await Product.find({ createdByUserId: user._id, auctionStatus: 'suspended' });
        res.render('seller_auction', { products: auctions });
    } catch (error) {
        console.error('Error fetching suspended auctions:', error);
        res.status(500).send('Internal Server Error');
    }
};


exports.getCreateAuction = async (req, res) => {
    try {
        const categories = await Category.find({ status: 'active' });
        res.render('seller_create', { editMode: false, categories, errorMessage: false });
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
            const { title, category_id, condition, description, start_date, end_date, reserve_price} = req.body;

            // Validate form data
            if (!title || !category_id || !condition || !description || !start_date || !end_date || !reserve_price ) {
                const errorMessage = 'All details must be provided.';
                return res.render('seller_create', { errorMessage, editMode, categories });
            }

            if (!/[a-zA-Z]/.test(title)) {
                const errorMessage = 'Product name must include characters.';
                return res.render('seller_create', { errorMessage, editMode, categories });
            }

            const startDate = new Date(start_date);
            const endDate = new Date(end_date);
            const dayAfterTomorrow = new Date();
            dayAfterTomorrow.setDate(dayAfterTomorrow.getDate()+1);

            if (startDate <= dayAfterTomorrow) {
                const errorMessage = 'Start date should be after the day after tomorrow.';
                return res.render('seller_create', { errorMessage, editMode, categories });
            }

            if (endDate <= startDate) {
                const errorMessage = 'End date must be after start date.';
                return res.render('seller_create', { errorMessage, editMode, categories });
            }

            // Validate reserve price
            const reservePrice = parseFloat(reserve_price);
            if (isNaN(reservePrice) || reservePrice <= 0) {
                const errorMessage = 'Reserve price must be a positive number.';
                return res.render('seller_create', { errorMessage, editMode, categories });
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
                createdByUserId: req.session.user._id, // Store the ID of the logged-in user who creates the product
                createdAt: new Date(), // Store the current date and time
                lastUpdatedBy: {
                    username: "seller",
                    updatedAt: new Date()
                }
            });

            // Save the new product to the database
            await newProduct.save();
            console.log('Product saved successfully');
            res.redirect('/seller/auctions');
        });
    } catch (error) {
        console.error('Error saving product:', error);
        res.status(500).send('Error saving product');
    }
};




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

        res.render('seller_create', { editMode, product, errorMessage, categories });
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
//         const { title, category_id, condition, start_date, end_date, reserve_price, description} = req.body;

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
//             lastUpdatedBy: {
//                 username: "seller",
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
//         res.redirect('/seller/auctions');
//     } catch (error) {
//         console.error('Error updating auction:', error);
//         res.status(500).send('Internal Server Error');
//     }
// };
exports.updateFields = async (req, res) => {
    try {
        const productId = req.params.id;
        const { title, category_id, condition, start_date, end_date, reserve_price, description} = req.body;

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
            lastUpdatedBy: {
                username: "seller",
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
        res.redirect('/seller/auctions');
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
        res.render('seller_auction_view', { product, bids });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).send('Internal Server Error');
    }
};


