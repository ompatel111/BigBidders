const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/SellercategoryController');

// Routes related to categories

router.get('/categories', categoryController.getAllCategories);
router.get('/create_categories', categoryController.getCreateCategoryForm);
router.post('/create_categories', categoryController.createCategory);
router.get('/categories/:id?', categoryController.getCategoryForm);
router.post('/categories/:id', categoryController.updateCategory);
router.post('/delete/:id', categoryController.deleteCategory);

module.exports = router;
