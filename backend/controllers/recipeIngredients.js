const db = require('../config/db');

exports.getAllRecipeIngredients = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT ri.*, i.name AS ingredient_name, u.symbol AS unit_symbol, r.product_id
       FROM recipe_ingredients ri
       LEFT JOIN ingredients i ON ri.ingredient_id = i.id
       LEFT JOIN units u ON ri.unit_id = u.id
       LEFT JOIN recipes r ON ri.recipe_id = r.id
       ORDER BY ri.id`
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

exports.getRecipeIngredientById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT ri.*, i.name AS ingredient_name, u.symbol AS unit_symbol, r.product_id
       FROM recipe_ingredients ri
       LEFT JOIN ingredients i ON ri.ingredient_id = i.id
       LEFT JOIN units u ON ri.unit_id = u.id
       LEFT JOIN recipes r ON ri.recipe_id = r.id
       WHERE ri.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recipe ingredient not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.createRecipeIngredient = async (req, res, next) => {
  try {
    const { recipe_id, ingredient_id, quantity, unit_id } = req.body;
    const result = await db.query(
      `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [recipe_id, ingredient_id, quantity, unit_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.updateRecipeIngredient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { recipe_id, ingredient_id, quantity, unit_id } = req.body;
    const result = await db.query(
      `UPDATE recipe_ingredients
       SET recipe_id = $1, ingredient_id = $2, quantity = $3, unit_id = $4
       WHERE id = $5 RETURNING *`,
      [recipe_id, ingredient_id, quantity, unit_id, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recipe ingredient not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.deleteRecipeIngredient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM recipe_ingredients WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recipe ingredient not found' });
    }
    res.json({ message: 'Recipe ingredient deleted successfully' });
  } catch (error) {
    next(error);
  }
};
