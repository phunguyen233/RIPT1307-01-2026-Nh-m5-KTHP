const express = require('express');
const router = express.Router();
const inventoryLogsController = require('../controllers/inventoryLogs');

router.get('/', inventoryLogsController.getAllInventoryLogs);
router.get('/:id', inventoryLogsController.getInventoryLogById);
router.post('/', inventoryLogsController.createInventoryLog);
router.put('/:id', inventoryLogsController.updateInventoryLog);
router.delete('/:id', inventoryLogsController.deleteInventoryLog);

module.exports = router;
