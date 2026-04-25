const db = require('../config/db');

exports.getAllShops = async (req, res, next) => {
  try {
    const result = await db.query('SELECT id, name, email, api_key, created_at FROM shops ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

exports.getShopById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT id, name, email, api_key, created_at FROM shops WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.getShopByApiKey = async (req, res, next) => {
  try {
    const { apiKey } = req.params;
    const result = await db.query(
      'SELECT id, name, email, api_key, created_at FROM shops WHERE api_key = $1',
      [apiKey]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Shop not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.createShop = async (req, res, next) => {
  try {
    const { name, email, api_key } = req.body;
    const { user } = req;

    // Validate input
    if (!name || !api_key) {
      return res.status(400).json({ error: 'Name and api_key are required' });
    }

    // Chỉ admin mới được tạo shop
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can create shop' });
    }

    // Kiểm tra admin chưa có shop_id
    const userCheck = await db.query('SELECT shop_id FROM users WHERE id = $1', [user.id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (userCheck.rows[0].shop_id !== null) {
      return res.status(400).json({ error: 'User already has a shop' });
    }

    // Tạo shop mới
    const shopResult = await db.query(
      'INSERT INTO shops (name, email, api_key) VALUES ($1, $2, $3) RETURNING id, name, email, api_key, created_at',
      [name, email || null, api_key]
    );

    const shopId = shopResult.rows[0].id;

    // Cập nhật user với shop_id
    await db.query(
      'UPDATE users SET shop_id = $1 WHERE id = $2',
      [shopId, user.id]
    );

    res.status(201).json({
      message: 'Shop created and linked to user successfully',
      shop: shopResult.rows[0],
      user_id: user.id,
      shop_id: shopId
    });
  } catch (error) {
    next(error);
  }
};

exports.updateShop = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    const result = await db.query(
      'UPDATE shops SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email, api_key, created_at',
      [name, email, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.deleteShop = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM shops WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    res.json({ message: 'Shop deleted successfully' });
  } catch (error) {
    next(error);
  }
};
