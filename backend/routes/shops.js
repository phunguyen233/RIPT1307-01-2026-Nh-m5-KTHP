const express = require('express');
const router = express.Router();
const shopsController = require('../controllers/shops');

router.get('/', shopsController.getAllShops);
router.get('/:id', shopsController.getShopById);
router.get('/api-key/:apiKey', shopsController.getShopByApiKey);
router.post('/', shopsController.createShop);
router.put('/:id', shopsController.updateShop);
router.delete('/:id', shopsController.deleteShop);

module.exports = router;
