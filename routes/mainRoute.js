const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const updateUserRoute = require('../controllers/userController');
const Category = require('../models/category');
const User = require('../models/user');
const Bid = require('../models/bid');
const checkAuth = require('../middleware/checkAuth');
const stripe = require('stripe')('sk_test_51P90KUSJcI6FJDtQJjJAXGPer1AJp5ma7kBuphDP7aEAYRNwyjwgoGmaeaRXlFwuZ8dP5z169toK3YjyI9HmwMQU00rJ4uffgh')
const nodemailer = require('nodemailer');
// Routes for homepage and product related actions
router.get(['/', '/index'], async (req, res) => {
  try {
    // Fetch all categories from the database
    const categories = await Category.find({ status: 'active' });

    // Fetch all products from the database without any filtration
    const products = await Product.find().sort({ biddingEndTime: 1 });

    // Fetch upcoming auctions approved by admin but not started yet
    const upcomingAuctions = await Product.find({
      adminStatus: 'approved',
      biddingStartTime: { $gt: new Date() } // Auctions that haven't started yet
    }).sort({ biddingStartTime: 1 });

    // Fetch closed auctions
    const closedAuctions = await Product.find({
      adminStatus: 'approved',
      biddingEndTime: { $lt: new Date() } // Auctions that have ended
    }).sort({ biddingEndTime: -1 }); // Sort by end time in descending order to display latest closed auctions first

    // Render the index view with all products, upcoming auctions, closed auctions, and categories
    res.render('index', { products, upcomingAuctions, closedAuctions, categories, user: req.session.user });
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).send('Server error');
  }
});


router.get('/user-dashboard',checkAuth, async (req, res) => {
  // Check if the user is authenticated
  if (req.session.user) {
      try {
          const userId = req.session.user._id;

          // Fetch total count of auctions submitted by the logged-in user
          const totalAuctions = await Bid.countDocuments({ user: userId });

          // Fetch count of won auctions for the logged-in user
          const wonAuctions = await Bid.countDocuments({ user: userId, win: true });

          // Fetch count of completed payments for the logged-in user
          const totalPayments = await Bid.countDocuments({ user: userId, paymentStatus: 'completed' });

          // Render the user dashboard view with the user-specific data
          res.render('user-dashboard', { totalAuctions, wonAuctions, totalPayments });
      } catch (error) {
          console.error('Error fetching user data:', error);
          res.status(500).send('Internal Server Error');
      }
  } else {
      // If the user is not authenticated, redirect to the login page
      res.redirect('/login');
  }
});




router.get('/my-auctions',checkAuth, async (req, res) => {
    try {
        // Fetch bids submitted by the logged-in user
        const bids = await Bid.find({ user: req.session.user._id }).populate('product').lean();
        
        // Render bid-history view with filtered bids data
        res.render('my-auctions', { bids, req });
    } catch (error) {
        console.error('Error fetching bid history:', error);
        res.status(500).send('Internal Server Error');
    }
});


router.get('/thankyou',async (req, res) => {
  res.render('thankyou')
})

// for payment page
router.post("/payment", async (req, res) => {
  const { price, email,productName, pk } = req.body; // Changed 'product' to 'productName'

  try {
      const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [{
              price_data: {
                  currency: 'usd',
                  product_data: {
                      name: productName, // Use the product name here
                  },
                  unit_amount: price * 100, // Convert price to cents
              },
              quantity: 1,
          }],
          mode: 'payment',
          success_url: 'http://localhost:5000/success',
          cancel_url: 'http://localhost:5000/cancel',
          customer_email: email, 
          metadata: {
              publisher_key: pk,
          }
      });

      res.redirect(session.url);
  } catch (error) {
      console.error('Error processing payment:', error);
      res.status(500).send('Error processing payment');
  }
});

// Handle payment success
router.get('/success', (req, res) => {
  res.send('Payment Successful');
});

// Handle payment cancellation
router.get('/cancel', (req, res) => {
  res.send('Payment Rejected');
});
router.get('/checkout',async (req, res) => {
  res.render('checkout')
})
router.get('/about',async (req, res) => {
  res.render('about')
})
router.get('/privacy',async (req, res) => {
  res.render('privacy')
})
router.get('/contact', (req, res) => {
  res.render('contact');
});

// Route to handle the winner page
// router.get('/winner',checkAuth, async (req, res) => {
//   try {
//       // Extract productId from the query string
//       const productId = req.query.productId;

//       // Fetch the bid information based on productId
//       const bid = await Bid.findOne({ product: productId, win: true })
//           .populate('user') // Populate the user field
//           .populate('product'); // Populate the product field

//       if (!bid) {
//           return res.status(404).send('Bid not found');
//       }

//       // Render the winner template with bid information
//       res.render('winner', { bid ,req:req});
//   } catch (err) {
//       console.error(err);
//       res.status(500).send('Internal Server Error');
//   }
// });
router.get('/winner', checkAuth, async (req, res) => {
  try {
      // Extract productId from the query string
      const productId = req.query.productId;

      // Fetch the bid information based on productId
      const bid = await Bid.findOne({ product: productId, win: true })
          .populate('user') 
          .populate('product'); 

      if (!bid) {
          return res.status(404).send('Bid not found');
      }

      // Send email to the winner
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        port: 465, 
        secure: true,
        logger:true,
        debug:true,
        secureConnection:false,
        auth: {
          user: 'dhruvilshah884@gmail.com',
          pass: 'wkuv sjqf bsxy bqqj'
        },
        tls:{
          rejectUnauthorized: true
        }
      });

      const mailOptions = {
          from: 'dhruvilshah884@gmail.com',
          to: bid.user.email, // Winner's email address
          subject: 'Congratulations! You Won the Auction',
          text: `Congratulations! You have won the auction for ${bid.product.name} with a bid amount of ${bid.amount}.`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              console.error('Error sending email:', error);
          } else {
              console.log('Email sent:', info.response);
          }
      });

      
      res.render('winner', { bid, req: req });
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
  }
});
// router.get('/checkout/:productId', async (req, res) => {
//   try {
//       // Fetch the currently logged-in user's details
//       const userId = req.session.user._id;
//       const user = await User.findById(userId);

//       // Fetch the product ID from the URL parameters
//       const productId = req.params.productId;

//       // Fetch the bid details associated with the product ID and user ID
//       const bid = await Bid.findOne({ user: userId, product: productId });

//       // Render the checkout page with user details and bid details
//       res.render('checkout', { user: user, bid: bid });
//   } catch (error) {
//       console.error('Error fetching checkout data:', error);
//       res.status(500).send('Internal Server Error');
//   }
// });

router.get('/user/:userId',checkAuth, updateUserRoute.loadUserDetails);
router.post('/user/:userId',checkAuth,updateUserRoute.updateUserDetails);
module.exports = router;
