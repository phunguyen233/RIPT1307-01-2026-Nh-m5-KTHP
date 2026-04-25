const db = require('../config/db');

exports.getAllRecipes = async (req, res, next) => {
  try {
    const shop_id = req.user.shop_id;
    const result = await db.query(
      `SELECT r.*, p.name AS product_name
       FROM recipes r
       LEFT JOIN products p ON r.product_id = p.id
       WHERE p.shop_id = $1
       ORDER BY r.id`,
      [shop_id]
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

exports.getRecipeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shop_id = req.user.shop_id;
    const result = await db.query(
      `SELECT r.*, p.name AS product_name
       FROM recipes r
       LEFT JOIN products p ON r.product_id = p.id
       WHERE r.id = $1 AND p.shop_id = $2`,
      [id, shop_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.createRecipe = async (req, res, next) => {
  try {
    const { product_id } = req.body;
    const shop_id = req.user.shop_id;
    
    // Verify product belongs to this shop
    const productCheck = await db.query('SELECT id FROM products WHERE id = $1 AND shop_id = $2', [product_id, shop_id]);
    if (productCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Product not found or does not belong to your shop' });
    }
    
    const result = await db.query('INSERT INTO recipes (product_id) VALUES ($1) RETURNING *', [product_id]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.updateRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { product_id } = req.body;
    const shop_id = req.user.shop_id;
    
    // Verify recipe belongs to this shop
    const recipeCheck = await db.query(
      `SELECT r.id FROM recipes r
       LEFT JOIN products p ON r.product_id = p.id
       WHERE r.id = $1 AND p.shop_id = $2`,
      [id, shop_id]
    );
    if (recipeCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    const result = await db.query('UPDATE recipes SET product_id = $1 WHERE id = $2 RETURNING *', [product_id, id]);
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.deleteRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shop_id = req.user.shop_id;
    
    // Verify recipe belongs to this shop
    const recipeCheck = await db.query(
      `SELECT r.id FROM recipes r
       LEFT JOIN products p ON r.product_id = p.id
       WHERE r.id = $1 AND p.shop_id = $2`,
      [id, shop_id]
    );
    if (recipeCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    const result = await db.query('DELETE FROM recipes WHERE id = $1 RETURNING id', [id]);
    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    next(error);
  }
};
