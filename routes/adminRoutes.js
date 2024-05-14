const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const UserController = require('../controllers/adminSideUserController');

// Admin routes
router.get('/password', adminController.getPassword);
router.get('/profile', adminController.getProfile);

// router.get('/dashboard', adminController.getDashboard);
router.get('/dashboard', adminController.getAdmin);
router.get('/notifications', adminController.showDetails);
// User routes
router.get('/user_create', UserController.getUserCreatePage);
router.post('/users/create', UserController.createUser);
router.get('/users/view/:id', UserController.viewUserDetails);
router.post('/users/update/:id', UserController.updateUser);
router.get('/users/edit/:id?', UserController.editUser);
router.get('/users/:id/toggle-status', UserController.toggleUserStatus);
router.get('/users', UserController.getAllUsers);
router.get('/blocked_users', UserController.getBlockedUsers);


module.exports = router;
