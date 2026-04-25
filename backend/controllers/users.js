const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateApiKey } = require('../utils/apiKeyGenerator');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Hàm validate email
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ĐĂNG KÝ ADMIN (chỉ cho admin-frontend)
exports.registerAdmin = async (req, res, next) => {
  try {
    const { name, email, password, shop_name, shop_email } = req.body;

    // Validate input
    if (!name || !email || !password || !shop_name) {
      return res.status(400).json({ error: 'Name, email, password, and shop_name are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Kiểm tra email đã tồn tại
    const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate API key
    const apiKey = generateApiKey();

    // Create shop first
    const shopResult = await db.query(
      'INSERT INTO shops (name, email, api_key) VALUES ($1, $2, $3) RETURNING id, name, email, api_key, created_at',
      [shop_name, shop_email || null, apiKey]
    );
    
    const shopId = shopResult.rows[0].id;

    // Create user with shop_id
    const userResult = await db.query(
      'INSERT INTO users (name, email, password, role, shop_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, shop_id, created_at',
      [name, email, hashedPassword, 'admin', shopId]
    );

    const user = userResult.rows[0];

    // Create JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        shop_id: user.shop_id,
        api_key: apiKey
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Admin registered successfully',
      user: {
        ...user,
        api_key: apiKey
      },
      token,
      shop: shopResult.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// ĐĂNG KÝ KHÁCH HÀNG (chỉ cho shop-frontend và ShopAIApp)
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, shop_id, api_key } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // If shop_id and api_key are provided, verify they exist
    if (shop_id && api_key) {
      const shopExists = await db.query(
        'SELECT id FROM shops WHERE id = $1 AND api_key = $2',
        [shop_id, api_key]
      );
      if (shopExists.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid shop credentials' });
      }
    }

    // Kiểm tra email đã tồn tại
    const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo user mới với role customer
    const result = await db.query(
      'INSERT INTO users (name, email, password, role, shop_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, shop_id, created_at',
      [name, email, hashedPassword, 'customer', shop_id || null]
    );

    // Tạo JWT token
    const token = jwt.sign(
      { id: result.rows[0].id, email: result.rows[0].email, role: result.rows[0].role, shop_id: shop_id || null },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: result.rows[0],
      token
    });
  } catch (error) {
    next(error);
  }
};

// ĐĂNG NHẬP
exports.login = async (req, res, next) => {
  try {
    const { email, password, api_key } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Tìm user theo email
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Kiểm tra password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Tạo JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        shop_id: user.shop_id
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Get shop info if user has shop_id
    let shopInfo = null;
    if (user.shop_id) {
      const shopResult = await db.query('SELECT id, name, email, api_key FROM shops WHERE id = $1', [user.shop_id]);
      if (shopResult.rows.length > 0) {
        shopInfo = shopResult.rows[0];
      }
    }

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        shop_id: user.shop_id,
        api_key: shopInfo?.api_key || null,
        created_at: user.created_at
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

// Middleware xác thực token
exports.verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Middleware xác thực API key
exports.verifyApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      return res.status(401).json({ error: 'API key required' });
    }

    const result = await db.query('SELECT id FROM shops WHERE api_key = $1', [apiKey]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    req.shopId = result.rows[0].id;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const result = await db.query('SELECT id, name, email, role, shop_id, created_at FROM users ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT id, name, email, role, shop_id, created_at FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, shop_id } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || '', salt);

    const result = await db.query(
      'INSERT INTO users (name, email, password, role, shop_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, shop_id, created_at',
      [name, email, hashedPassword, role || 'customer', shop_id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role, shop_id } = req.body;
    const result = await db.query(
      'UPDATE users SET name = $1, email = $2, role = $3, shop_id = $4 WHERE id = $5 RETURNING id, name, email, role, shop_id, created_at',
      [name, email, role, shop_id || null, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};
