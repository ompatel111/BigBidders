const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const authMiddleware = require('./middleware/authMiddleware');
const signupRoute = require('./routes/signupRoute');
const loginRoute = require('./routes/loginRoute');
const adminRoute = require('./routes/adminRoutes');
const sellerRoute = require('./routes/SellerRoutes');
const mainRoute = require('./routes/mainRoute');
const productsRouter = require('./routes/adminProductRoute');
const sellerRouter = require('./routes/SellerProductRoute');
const productsRoute = require('./routes/productRoute');
const categoryRoute = require('./routes/categoryRoute');
const SellercategoryRoute = require('./routes/SellercategoryRoute');
const bidRoute = require('./routes/bidRoutes');
const apiRoutes = require('./routes/apiRoutes')
const contactRoute = require('./routes/contactRoutes')
const checkAuth = require('./middleware/checkAuth');

const mongoose = require('./db/db'); // Import the mongoose connection

const app = express();
const port = process.env.PORT || 5000;

// Middleware configurations
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

// View engine setup
app.set('view engine', 'ejs');
// Set up the new views directories
app.set('views', [
  path.join(__dirname, '../templates/views'),
  path.join(__dirname, '../templates/views/include'),
  path.join(__dirname, '../templates/views/adminViews'), 
  path.join(__dirname, '../templates/views/sellerViews'), 
  path.join(__dirname, '../templates/views/userViews') 
]);

app.use(express.static(path.join(__dirname, "../public")));

const auctionScheduler = require('./helpers/auctionScheduler');

// Routes

app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});
app.use('/api/bid', bidRoute);


app.use('/api/bid', apiRoutes);
// Authentication middleware for admin routes
app.use('/admin', authMiddleware.authenticateAdmin);

// Authentication middleware for seller routes
app.use('/seller', authMiddleware.authenticateSeller);

// Route configurations
app.use('/', signupRoute);
app.use('/', loginRoute);
app.use('/admin',checkAuth, adminRoute);
app.use('/seller',checkAuth, sellerRoute);
app.use('/', mainRoute);
app.use('/', contactRoute);
app.use('/admin',checkAuth, categoryRoute);
app.use('/seller',checkAuth, SellercategoryRoute);

app.use('/logout', loginRoute);
app.use('/admin',checkAuth, productsRouter);
app.use('/seller',checkAuth, sellerRouter);
app.use('/',checkAuth, productsRoute);
app.use('/',checkAuth, bidRoute);

// Start the server
app.listen(port, () => console.log(`Server listening on port ${port}`));
