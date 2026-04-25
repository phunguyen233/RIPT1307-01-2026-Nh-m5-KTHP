const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { verifyAdminToken, verifyToken } = require('./middleware/authMiddleware');

const shopsRoutes = require('./routes/shops');
const usersRoutes = require('./routes/users');
const customersRoutes = require('./routes/customers');
const unitsRoutes = require('./routes/units');
const categoriesRoutes = require('./routes/categories');
const productsRoutes = require('./routes/products');
const ordersRoutes = require('./routes/orders');
const orderItemsRoutes = require('./routes/orderItems');
const ingredientsRoutes = require('./routes/ingredients');
const recipesRoutes = require('./routes/recipes');
const recipeIngredientsRoutes = require('./routes/recipeIngredients');
const inventoryImportsRoutes = require('./routes/inventoryImports');
const inventoryLogsRoutes = require('./routes/inventoryLogs');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.get('/', (req, res) => {
  res.json({ message: 'Bếp Măm backend is running', status: 'ok' });
});

app.use('/api/shops', verifyAdminToken, shopsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/customers', verifyAdminToken, customersRoutes);
app.use('/api/units', unitsRoutes);
app.use('/api/categories', verifyAdminToken, categoriesRoutes);
app.use('/api/products', verifyAdminToken, productsRoutes);
app.use('/api/orders', verifyAdminToken, ordersRoutes);
app.use('/api/order-items', verifyAdminToken, orderItemsRoutes);
app.use('/api/ingredients', verifyAdminToken, ingredientsRoutes);
app.use('/api/recipes', verifyAdminToken, recipesRoutes);
app.use('/api/recipe-ingredients', verifyAdminToken, recipeIngredientsRoutes);
app.use('/api/inventory-imports', verifyAdminToken, inventoryImportsRoutes);
app.use('/api/inventory-logs', verifyAdminToken, inventoryLogsRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Resource not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
