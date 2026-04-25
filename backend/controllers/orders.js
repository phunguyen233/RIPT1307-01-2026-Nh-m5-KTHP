const db = require('../config/db');

exports.getAllOrders = async (req, res, next) => {
  try {
    const shop_id = req.user.shop_id;

    const query = `SELECT o.*, c.name AS customer_name, c.phone AS customer_phone
                   FROM orders o
                   LEFT JOIN customers c ON o.customer_id = c.id
                   WHERE o.shop_id = $1
                   ORDER BY o.id`;

    const result = await db.query(query, [shop_id]);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shop_id = req.user.shop_id;

    const orderResult = await db.query(
      `SELECT o.*, c.name AS customer_name, c.phone AS customer_phone
       FROM orders o
       LEFT JOIN customers c ON o.customer_id = c.id
       WHERE o.id = $1 AND o.shop_id = $2`,
      [id, shop_id]
    );
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const itemsResult = await db.query(
      `SELECT oi.*, p.name AS product_name
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [id]
    );
    res.json({ ...orderResult.rows[0], order_items: itemsResult.rows });
  } catch (error) {
    next(error);
  }
};

exports.createOrder = async (req, res, next) => {
  try {
    const { customer_id, shipping_address, total_price, status } = req.body;
    const shop_id = req.user.shop_id;

    // Generate order_code
    const codeQuery = `SELECT COALESCE(MAX(CAST(SUBSTRING(order_code FROM 3) AS INTEGER)), 0) + 1 AS next_number
                       FROM orders WHERE shop_id = $1 AND order_code LIKE 'DH%'`;
    const codeResult = await db.query(codeQuery, [shop_id]);
    const nextNumber = codeResult.rows[0].next_number;
    const order_code = 'DH' + nextNumber.toString();

    const result = await db.query(
      'INSERT INTO orders (customer_id, shipping_address, total_price, status, shop_id, order_code) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [customer_id, shipping_address, total_price || 0, status || 'pending', shop_id, order_code]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.updateOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { customer_id, shipping_address, total_price, status, order_code } = req.body;
    const shop_id = req.user.shop_id;

    const query = 'UPDATE orders SET customer_id = $1, shipping_address = $2, total_price = $3, status = $4, order_code = $5 WHERE id = $6 AND shop_id = $7 RETURNING *';
    const result = await db.query(query, [customer_id, shipping_address, total_price, status, order_code, id, shop_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shop_id = req.user.shop_id;

    const query = 'DELETE FROM orders WHERE id = $1 AND shop_id = $2 RETURNING id';
    const result = await db.query(query, [id, shop_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.processOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shop_id = req.user.shop_id;

    // Verify order belongs to this shop
    const orderCheck = await db.query('SELECT id FROM orders WHERE id = $1 AND shop_id = $2', [id, shop_id]);
    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await db.query('SELECT process_order($1)', [id]);
    await db.query('UPDATE orders SET status = $1 WHERE id = $2', ['completed', id]);
    res.json({ message: 'Order processed and inventory updated' });
  } catch (error) {
    next(error);
  }
};
