const db = require('../config/db');

exports.getAllInventoryLogs = async (req, res, next) => {
  try {
    const shop_id = req.user.shop_id;
    const result = await db.query(
      `SELECT il.*, i.name AS ingredient_name
       FROM inventory_logs il
       LEFT JOIN ingredients i ON il.ingredient_id = i.id
       WHERE il.shop_id = $1
       ORDER BY il.id`,
      [shop_id]
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

exports.getInventoryLogById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shop_id = req.user.shop_id;
    const result = await db.query(
      `SELECT il.*, i.name AS ingredient_name
       FROM inventory_logs il
       LEFT JOIN ingredients i ON il.ingredient_id = i.id
       WHERE il.id = $1 AND il.shop_id = $2`,
      [id, shop_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory log not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.createInventoryLog = async (req, res, next) => {
  try {
    const { ingredient_id, change_type, quantity, note } = req.body;
    const shop_id = req.user.shop_id;
    
    // Verify ingredient belongs to this shop
    const ingredientCheck = await db.query('SELECT id FROM ingredients WHERE id = $1 AND shop_id = $2', [ingredient_id, shop_id]);
    if (ingredientCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Ingredient not found or does not belong to your shop' });
    }
    
    const result = await db.query(
      `INSERT INTO inventory_logs (ingredient_id, change_type, quantity, note, shop_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [ingredient_id, change_type, quantity, note, shop_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.updateInventoryLog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { ingredient_id, change_type, quantity, note } = req.body;
    const shop_id = req.user.shop_id;
    
    const result = await db.query(
      `UPDATE inventory_logs
       SET ingredient_id = $1, change_type = $2, quantity = $3, note = $4
       WHERE id = $5 AND shop_id = $6 RETURNING *`,
      [ingredient_id, change_type, quantity, note, id, shop_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory log not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.deleteInventoryLog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shop_id = req.user.shop_id;
    const result = await db.query('DELETE FROM inventory_logs WHERE id = $1 AND shop_id = $2 RETURNING id', [id, shop_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory log not found' });
    }
    res.json({ message: 'Inventory log deleted successfully' });
  } catch (error) {
    next(error);
  }
};
