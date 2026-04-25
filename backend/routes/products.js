const express = require('express');
const router = express.Router();
const productsController = require('../controllers/products');
const usersController = require('../controllers/users');

// Public routes (accessible with API key or token)
router.get('/', productsController.getAllProducts);
router.get('/:id', productsController.getProductById);

// Protected routes (require token)
router.post('/', usersController.verifyToken, productsController.createProduct);
router.post('/with-image', usersController.verifyToken, productsController.createProductWithImage);
router.put('/:id', usersController.verifyToken, productsController.updateProduct);
router.put('/:id/with-image', usersController.verifyToken, productsController.updateProductWithImage);
router.delete('/:id', usersController.verifyToken, productsController.deleteProduct);

module.exports = router;
