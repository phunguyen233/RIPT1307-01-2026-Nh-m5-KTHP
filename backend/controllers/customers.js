const db = require('../config/db');

exports.getAllCustomers = async (req, res, next) => {
  try {
    const shop_id = req.user.shop_id;
    const result = await db.query(
      `SELECT c.*, u.name AS user_name, u.email AS user_email
       FROM customers c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.shop_id = $1
       ORDER BY c.id`,
      [shop_id]
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

exports.getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shop_id = req.user.shop_id;
    const result = await db.query(
      `SELECT c.*, u.name AS user_name, u.email AS user_email
       FROM customers c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.id = $1 AND c.shop_id = $2`,
      [id, shop_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.createCustomer = async (req, res, next) => {
  try {
    const { user_id, name, phone, address, total_spent } = req.body;
    const shop_id = req.user.shop_id;

    // Generate customer_code
    const codeQuery = `SELECT COALESCE(MAX(CAST(SUBSTRING(customer_code FROM 3) AS INTEGER)), 0) + 1 AS next_number
                       FROM customers WHERE shop_id = $1 AND customer_code LIKE 'KH%'`;
    const codeResult = await db.query(codeQuery, [shop_id]);
    const nextNumber = codeResult.rows[0].next_number;
    const customer_code = 'KH' + nextNumber.toString();

    const result = await db.query(
      'INSERT INTO customers (user_id, name, phone, address, total_spent, shop_id, customer_code) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [user_id || null, name, phone, address, total_spent || 0, shop_id, customer_code]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user_id, name, phone, address, total_spent, customer_code } = req.body;
    const shop_id = req.user.shop_id;
    const result = await db.query(
      'UPDATE customers SET user_id = $1, name = $2, phone = $3, address = $4, total_spent = $5, customer_code = $6 WHERE id = $7 AND shop_id = $8 RETURNING *',
      [user_id || null, name, phone, address, total_spent, customer_code, id, shop_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shop_id = req.user.shop_id;
    const result = await db.query('DELETE FROM customers WHERE id = $1 AND shop_id = $2 RETURNING id', [id, shop_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    next(error);
  }
};
