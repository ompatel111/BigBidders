// auctionScheduler.js

const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Product = require('../models/product');
const Bid = require('../models/bid');
const User = require('../models/user');

// Initialize last check time
let lastCheckTime = new Date();

// Function to update auction status for expired products
const updateExpiredAuctionStatus = async () => {
  try {
    // Find and update products with bidding end time in the past
    const expiredProducts = await Product.find({ biddingEndTime: { $lte: new Date() }, auctionStatus: 'open' });

    // Iterate over each expired product
    for (const product of expiredProducts) {
      // Find the highest bidding user for the product
      const highestBid = await Bid.findOne({ product: product._id }).sort({ amount: -1 });

      // If there is a highest bid, mark the user as winner and send email
      if (highestBid) {
        await Bid.updateOne({ _id: highestBid._id }, { win: true });
        console.log(`User ${highestBid.user} marked as winner for product ${product._id}`);
        const user = await User.findById(highestBid.user); // Assuming you have a user schema
        if (user) {
          await sendEmailToWinner(user.email, product);
        } else {
          console.error(`User with ID ${highestBid.user} not found.`);
        }
      }
      
      // Update auction status to closed
      await Product.updateOne({ _id: product._id }, { auctionStatus: 'closed' });
      console.log(`Auction status updated to closed for product ${product._id}`);
    }
    
  } catch (error) {
    console.error('Error updating auction status:', error);
  }
};

// Function to send email to the winning user
const sendEmailToWinner = async (userEmail, product) => {
  try {
    // Initialize nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'smtp.gmail.com',
      port : 465,
      secure: true,
      auth: {
        user: 'pbtechworld@gmail.com',
        pass: 'hfro kamk yduf cht'
      },
      tls: {
        rejectUnauthorized: true, 
    }
    });

    // Compose email message
    const mailOptions = {
      from: 'pbtechworld@gmail.com',
      to: userEmail,
      subject: 'Congratulations! You Won the Auction',
      text: `Dear Winner,\n\nCongratulations! You have won the auction for product ${product.name}.`
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to user ${userEmail} for winning product ${product._id}`);
  } catch (error) {
    console.error('Error sending email to winner:', error);
  }
};

// Function to update auction status for products with bidding start time in the past
const updateStartedAuctionStatus = async () => {
  try {
    // Find and update products with bidding start time in the past and adminStatus approved
    await Product.updateMany(
      { biddingStartTime: { $lte: new Date() }, auctionStatus: 'new', adminStatus: 'approved' },
      { $set: { auctionStatus: 'open' } }
    );
    console.log('Auction status updated to open for products with bidding start time started and adminStatus approved.');
  } catch (error) {
    console.error('Error updating auction status:', error);
  }
};

// Function to check if 5 seconds have passed since the last check
const checkIfFiveSecondsPassed = () => {
  const now = new Date();
  const secondsPassed = Math.floor((now.getTime() - lastCheckTime.getTime()) / 1000);
  lastCheckTime = now;
  return secondsPassed >= 5;
};

// Schedule the tasks to run every 5 seconds
cron.schedule('*/5 * * * * *', async () => {
  if (checkIfFiveSecondsPassed()) {
    await updateExpiredAuctionStatus();
    await updateStartedAuctionStatus();
  }
});

module.exports = { updateExpiredAuctionStatus, updateStartedAuctionStatus };
