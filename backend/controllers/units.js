const db = require('../config/db');

exports.getAllUnits = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM units ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

exports.getUnitById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM units WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Unit not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.createUnit = async (req, res, next) => {
  try {
    const { name, symbol, type, base_unit_id, conversion_factor } = req.body;
    const result = await db.query(
      'INSERT INTO units (name, symbol, type, base_unit_id, conversion_factor) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, symbol, type, base_unit_id || null, conversion_factor]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.updateUnit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, symbol, type, base_unit_id, conversion_factor } = req.body;
    const result = await db.query(
      'UPDATE units SET name = $1, symbol = $2, type = $3, base_unit_id = $4, conversion_factor = $5 WHERE id = $6 RETURNING *',
      [name, symbol, type, base_unit_id || null, conversion_factor, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Unit not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.deleteUnit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM units WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Unit not found' });
    }
    res.json({ message: 'Unit deleted successfully' });
  } catch (error) {
    next(error);
  }
};
