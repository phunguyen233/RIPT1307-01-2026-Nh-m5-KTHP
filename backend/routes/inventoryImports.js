const express = require('express');
const router = express.Router();
const inventoryImportsController = require('../controllers/inventoryImports');

router.get('/', inventoryImportsController.getAllInventoryImports);
router.get('/:id', inventoryImportsController.getInventoryImportById);
router.post('/', inventoryImportsController.createInventoryImport);
router.put('/:id', inventoryImportsController.updateInventoryImport);
router.delete('/:id', inventoryImportsController.deleteInventoryImport);

module.exports = router;
