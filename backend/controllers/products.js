const db = require('../config/db');
const { uploadImage, deleteImage } = require('../utils/cloudinaryUpload');

exports.getAllProducts = async (req, res, next) => {
  try {
    const { active, category_id, search } = req.query;
    const shop_id = req.user.shop_id;
    const filters = [];
    const values = [];

    // Always filter by shop_id
    values.push(shop_id);
    filters.push(`p.shop_id = $${values.length}`);

    if (active !== undefined) {
      values.push(active === 'true');
      filters.push(`p.is_active = $${values.length}`);
    }
    if (category_id) {
      values.push(category_id);
      filters.push(`p.category_id = $${values.length}`);
    }
    if (search) {
      values.push(`%${search}%`);
      filters.push(`p.name ILIKE $${values.length}`);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const query = `
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.id
    `;
    const result = await db.query(query, values);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shop_id = req.user.shop_id;

    const query = `SELECT p.*, c.name AS category_name
                   FROM products p
                   LEFT JOIN categories c ON p.category_id = c.id
                   WHERE p.id = $1 AND p.shop_id = $2`;

    const result = await db.query(query, [id, shop_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const { name, price, cost_price, description, image_url, category_id, is_active } = req.body;
    const shop_id = req.user.shop_id;

    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    // Generate product_code
    const codeQuery = `SELECT COALESCE(MAX(CAST(SUBSTRING(product_code FROM 3) AS INTEGER)), 0) + 1 AS next_number
                       FROM products WHERE shop_id = $1 AND product_code LIKE 'SP%'`;
    const codeResult = await db.query(codeQuery, [shop_id]);
    const nextNumber = codeResult.rows[0].next_number;
    const product_code = 'SP' + nextNumber.toString();

    const result = await db.query(
      `INSERT INTO products (name, price, cost_price, description, image_url, category_id, shop_id, is_active, product_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [name, price, cost_price || 0, description, image_url, category_id, shop_id, is_active !== false, product_code]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.createProductWithImage = async (req, res, next) => {
  try {
    const { name, price, cost_price, description, category_id, is_active, image_base64 } = req.body;
    const shop_id = req.user.shop_id;

    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    // Generate product_code
    const codeQuery = `SELECT COALESCE(MAX(CAST(SUBSTRING(product_code FROM 3) AS INTEGER)), 0) + 1 AS next_number
                       FROM products WHERE shop_id = $1 AND product_code LIKE 'SP%'`;
    const codeResult = await db.query(codeQuery, [shop_id]);
    const nextNumber = codeResult.rows[0].next_number;
    const product_code = 'SP' + nextNumber.toString();

    let imageUrl = null;

    // Upload image to Cloudinary if provided
    if (image_base64) {
      const uploadResult = await uploadImage(image_base64, `product-${Date.now()}-${name}`);
      if (!uploadResult.success) {
        return res.status(400).json({ error: 'Image upload failed', details: uploadResult.error });
      }
      imageUrl = uploadResult.url;
    }

    const result = await db.query(
      `INSERT INTO products (name, price, cost_price, description, image_url, category_id, shop_id, is_active, product_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [name, price, cost_price || 0, description, imageUrl, category_id, shop_id, is_active !== false, product_code]
    );

    res.status(201).json({
      message: 'Product created successfully',
      product: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, price, cost_price, description, image_url, category_id, is_active, product_code } = req.body;
    const shop_id = req.user.shop_id;

    const query = `UPDATE products SET name = $1, price = $2, cost_price = $3, description = $4,
      image_url = $5, category_id = $6, is_active = $7, product_code = $8
     WHERE id = $9 AND shop_id = $10 RETURNING *`;

    const result = await db.query(query, [name, price, cost_price || 0, description, image_url, category_id, is_active !== false, product_code, id, shop_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.updateProductWithImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, price, cost_price, description, category_id, is_active, image_base64, old_image_url, product_code } = req.body;
    const shop_id = req.user.shop_id;

    let imageUrl = old_image_url;

    // Upload new image if provided
    if (image_base64) {
      const uploadResult = await uploadImage(image_base64, `product-${Date.now()}-${name}`);
      if (!uploadResult.success) {
        return res.status(400).json({ error: 'Image upload failed', details: uploadResult.error });
      }
      imageUrl = uploadResult.url;
    }

    const query = `UPDATE products SET name = $1, price = $2, cost_price = $3, description = $4,
      image_url = $5, category_id = $6, is_active = $7, product_code = $8
     WHERE id = $9 AND shop_id = $10 RETURNING *`;

    const result = await db.query(query, [name, price, cost_price || 0, description, imageUrl, category_id, is_active !== false, product_code, id, shop_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      message: 'Product updated successfully',
      product: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shop_id = req.user.shop_id;

    const query = 'DELETE FROM products WHERE id = $1 AND shop_id = $2 RETURNING id, image_url';

    const result = await db.query(query, [id, shop_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};
