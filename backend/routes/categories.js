const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categories');
const usersController = require('../controllers/users');

// All routes require authentication
router.get('/', usersController.verifyToken, categoriesController.getAllCategories);
router.get('/:id', usersController.verifyToken, categoriesController.getCategoryById);
router.post('/', usersController.verifyToken, categoriesController.createCategory);
router.put('/:id', usersController.verifyToken, categoriesController.updateCategory);
router.delete('/:id', usersController.verifyToken, categoriesController.deleteCategory);

module.exports = router;
