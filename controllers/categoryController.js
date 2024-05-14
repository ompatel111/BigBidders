const Category = require('../models/category');
const multer = require('multer');
const upload = require('../middleware/upload');
exports.getCreateCategory = (req, res) => {
    try {
        const editMode = false;
        const errors = {};
        res.render('create_categories', { editMode, errors });
    } catch (error) {
        console.error('Error rendering create_categories form:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.render('categories', { categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getCreateCategoryForm = async (req, res) => {
    try {
        const editMode = false;
        const errors = {};
        res.render('create_categories', { editMode, errors });
    } catch (error) {
        console.error('Error rendering create_categories form:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.createCategory = async (req, res) => {
    try {
        // Handle image upload
        upload(req, res, async function (err) {
            if (err) {
                // Handle multer errors
                console.error('Multer error:', err);
                if (err instanceof multer.MulterError) {
                    // A Multer error occurred when uploading
                    return res.redirect('/create_categories?error=true');
                } else {
                    // An unknown error occurred when uploading
                    return res.redirect('/create_categories?error=true');
                }
            }

            // Image upload successful, now process form data
            const { category, description, status } = req.body;
            const errors = {};
            if (!category || category.trim() === '') {
                errors.category = 'Category name is required';
            }
            if (!status || !['active', 'inactive'].includes(status)) {
                errors.status = 'Invalid status';
            }
            const existingCategory = await Category.findOne({ name: category });
            if (existingCategory) {
                errors.category = 'Category name already exists';
            }
            if (Object.keys(errors).length > 0) {
                const categories = await Category.find();
                return res.render('create_categories', { editMode: false, category: {}, errors });
            }
            // Extract the filename of the uploaded image
            const image = req.file ? '/uploads/'+req.file.filename : null;
            const newCategory = new Category({ name: category, description, status, image });
            await newCategory.save();
            res.redirect('/admin/categories');
        });
    } catch (error) {
        console.error('Error creating category:', error);
        res.redirect('/create_categories?error=true');
    }
};


exports.getCategoryForm = async (req, res) => {
    try {
        let editMode = false;
        let category = {};
        let errors = {};
        if (req.params.id) {
            editMode = true;
            category = await Category.findById(req.params.id);
            if (!category) {
                return res.status(404).send('Category not found');
            }
        }
        res.render('create_categories', { editMode, category, errors });
    } catch (error) {
        console.error('Error rendering category form:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.updateCategory = async (req, res) => {
    try {
        // Handle image upload
        upload(req, res, async function (err) {
            if (err) {
                // Handle multer errors
                console.error('Multer error:', err);
                if (err instanceof multer.MulterError) {
                    // A Multer error occurred when uploading
                    return res.redirect('/create_categories?error=true');
                } else {
                    // An unknown error occurred when uploading
                    return res.redirect('/create_categories?error=true');
                }
            }

            // Image upload successful, now update category data
            const { category, description, status } = req.body;
            const categoryId = req.params.id;
            let imageData = {};

            if (req.file) {
                imageData = { image: '/uploads/' + req.file.filename };
            }

            await Category.findByIdAndUpdate(categoryId, { name: category, description, status, ...imageData });
            res.redirect('/admin/categories');
        });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        await Category.findByIdAndDelete(categoryId);
        res.redirect('/admin/categories');
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).send('Internal Server Error');
    }
};
