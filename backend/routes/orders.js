const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/orders');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, ordersController.getAllOrders);
router.get('/:id', verifyToken, ordersController.getOrderById);
router.post('/', verifyToken, ordersController.createOrder);
router.put('/:id', verifyToken, ordersController.updateOrder);
router.put('/:id/status', verifyToken, ordersController.updateOrderStatus);
router.delete('/:id', verifyToken, ordersController.deleteOrder);
router.post('/:id/process', verifyToken, ordersController.processOrder);

module.exports = router;
