const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Verify JWT token and extract user info + shop_id
 * Attaches user to req.user
 */
exports.verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Extract user info and shop_id from token
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      shop_id: decoded.shop_id,
      api_key: decoded.api_key
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Verify token and ensure user is admin
 */
exports.verifyAdminToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can access this' });
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      shop_id: decoded.shop_id,
      api_key: decoded.api_key
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Verify token using API key (for shop frontend/app)
 */
exports.verifyApiKey = (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({ error: 'No API key provided' });
    }

    const db = require('../config/db');
    db.query('SELECT * FROM shops WHERE api_key = $1', [apiKey], (err, result) => {
      if (err || result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid API key' });
      }

      req.shop = result.rows[0];
      next();
    });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
};
