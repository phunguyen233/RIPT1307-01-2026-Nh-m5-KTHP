const db = require('../config/db');

exports.getAllOrderItems = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT oi.*, p.name AS product_name, o.customer_id AS order_customer_id
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       LEFT JOIN orders o ON oi.order_id = o.id
       ORDER BY oi.id`
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

exports.getOrderItemById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT oi.*, p.name AS product_name
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order item not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.createOrderItem = async (req, res, next) => {
  try {
    const { order_id, product_id, quantity, price } = req.body;
    const result = await db.query(
      'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4) RETURNING *',
      [order_id, product_id, quantity, price]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.updateOrderItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { order_id, product_id, quantity, price } = req.body;
    const result = await db.query(
      'UPDATE order_items SET order_id = $1, product_id = $2, quantity = $3, price = $4 WHERE id = $5 RETURNING *',
      [order_id, product_id, quantity, price, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order item not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.deleteOrderItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM order_items WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order item not found' });
    }
    res.json({ message: 'Order item deleted successfully' });
  } catch (error) {
    next(error);
  }
};
