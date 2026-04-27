const express = require('express');
const router = express.Router();
const orderItemsController = require('../controllers/orderItems');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, orderItemsController.getAllOrderItems);
router.get('/:id', verifyToken, orderItemsController.getOrderItemById);
router.post('/', verifyToken, orderItemsController.createOrderItem);
router.put('/:id', verifyToken, orderItemsController.updateOrderItem);
router.delete('/:id', verifyToken, orderItemsController.deleteOrderItem);

module.exports = router;
