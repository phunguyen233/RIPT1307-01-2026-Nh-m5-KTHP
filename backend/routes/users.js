const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');

// Public routes (không cần xác thực)
router.post('/register/admin', usersController.registerAdmin);
router.post('/register', usersController.register);
router.post('/login', usersController.login);

// Protected routes (cần xác thực token)
router.get('/current-shop', usersController.verifyToken, usersController.getCurrentShopApiKey);
router.put('/current-shop/regenerate-key', usersController.verifyToken, usersController.regenerateApiKey);
router.get('/', usersController.verifyToken, usersController.getAllUsers);
router.get('/:id', usersController.verifyToken, usersController.getUserById);
router.put('/:id', usersController.verifyToken, usersController.updateUser);
router.delete('/:id', usersController.verifyToken, usersController.deleteUser);

module.exports = router;
