const db = require('../config/db');

exports.getAllInventoryImports = async (req, res, next) => {
  try {
    const shop_id = req.user.shop_id;
    const result = await db.query(
      `SELECT ii.*, i.name AS ingredient_name, u.symbol AS unit_symbol
       FROM inventory_imports ii
       LEFT JOIN ingredients i ON ii.ingredient_id = i.id
       LEFT JOIN units u ON ii.unit_id = u.id
       WHERE ii.shop_id = $1
       ORDER BY ii.id`,
      [shop_id]
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

exports.getInventoryImportById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shop_id = req.user.shop_id;
    const result = await db.query(
      `SELECT ii.*, i.name AS ingredient_name, u.symbol AS unit_symbol
       FROM inventory_imports ii
       LEFT JOIN ingredients i ON ii.ingredient_id = i.id
       LEFT JOIN units u ON ii.unit_id = u.id
       WHERE ii.id = $1 AND ii.shop_id = $2`,
      [id, shop_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory import not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.createInventoryImport = async (req, res, next) => {
  try {
    const { ingredient_id, quantity, unit_id, import_price } = req.body;
    const shop_id = req.user.shop_id;
    
    // Verify ingredient belongs to this shop
    const ingredientCheck = await db.query('SELECT id FROM ingredients WHERE id = $1 AND shop_id = $2', [ingredient_id, shop_id]);
    if (ingredientCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Ingredient not found or does not belong to your shop' });
    }
    
    const result = await db.query(
      `INSERT INTO inventory_imports (ingredient_id, quantity, unit_id, import_price, shop_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [ingredient_id, quantity, unit_id, import_price, shop_id]
    );

    // Convert imported quantity to the ingredient's stored unit before updating stock quantity
    const ingredientResult = await db.query('SELECT unit_id, stock_quantity FROM ingredients WHERE id = $1 AND shop_id = $2', [ingredient_id, shop_id]);
    const ingredientRow = ingredientResult.rows[0];
    const ingredientUnitId = ingredientRow.unit_id;

    const unitRows = await db.query('SELECT id, base_unit_id, conversion_factor, type FROM units');
    const unitMap = {};
    unitRows.rows.forEach(u => {
      unitMap[u.id] = u;
    });

    const getFactorToBase = (unitId) => {
      const unit = unitMap[unitId];
      if (!unit) return null;
      if (!unit.base_unit_id) return 1;
      const parentFactor = getFactorToBase(unit.base_unit_id);
      if (parentFactor === null) return null;
      return unit.conversion_factor * parentFactor;
    };

    const fromUnit = unitMap[unit_id];
    const toUnit = unitMap[ingredientUnitId];
    if (!fromUnit || !toUnit || fromUnit.type !== toUnit.type) {
      return res.status(400).json({ error: 'Đơn vị nhập kho và đơn vị của nguyên liệu không cùng loại' });
    }

    const fromFactor = getFactorToBase(fromUnit.id);
    const toFactor = getFactorToBase(toUnit.id);
    if (fromFactor === null || toFactor === null) {
      return res.status(400).json({ error: 'Không thể quy đổi đơn vị' });
    }

    const convertedQuantity = (quantity * fromFactor) / toFactor;
    await db.query('UPDATE ingredients SET stock_quantity = stock_quantity + $1 WHERE id = $2 AND shop_id = $3', [convertedQuantity, ingredient_id, shop_id]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.updateInventoryImport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { ingredient_id, quantity, unit_id, import_price } = req.body;
    const shop_id = req.user.shop_id;
    
    const result = await db.query(
      `UPDATE inventory_imports
       SET ingredient_id = $1, quantity = $2, unit_id = $3, import_price = $4
       WHERE id = $5 AND shop_id = $6 RETURNING *`,
      [ingredient_id, quantity, unit_id, import_price, id, shop_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory import not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.deleteInventoryImport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shop_id = req.user.shop_id;
    const result = await db.query('DELETE FROM inventory_imports WHERE id = $1 AND shop_id = $2 RETURNING id', [id, shop_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory import not found' });
    }
    res.json({ message: 'Inventory import deleted successfully' });
  } catch (error) {
    next(error);
  }
};
