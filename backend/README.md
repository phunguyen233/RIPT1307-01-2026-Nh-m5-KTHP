# Bếp Măm Backend

This backend provides a shared API for both the store management app and the storefront app using the supplied Supabase PostgreSQL database.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npm run dev
   ```

## Environment

The backend uses `.env` for database configuration. Example values are stored in `.env.example`.

## Base URL

`http://localhost:4000/api`

## Main resource endpoints

- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

- `GET /api/customers`
- `GET /api/customers/:id`
- `POST /api/customers`
- `PUT /api/customers/:id`
- `DELETE /api/customers/:id`

- `GET /api/units`
- `GET /api/units/:id`
- `POST /api/units`
- `PUT /api/units/:id`
- `DELETE /api/units/:id`

- `GET /api/categories`
- `GET /api/categories/:id`
- `POST /api/categories`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

- `GET /api/orders`
- `GET /api/orders/:id`
- `POST /api/orders`
- `PUT /api/orders/:id`
- `DELETE /api/orders/:id`
- `POST /api/orders/:id/process`

- `GET /api/order-items`
- `GET /api/order-items/:id`
- `POST /api/order-items`
- `PUT /api/order-items/:id`
- `DELETE /api/order-items/:id`

- `GET /api/ingredients`
- `GET /api/ingredients/:id`
- `POST /api/ingredients`
- `PUT /api/ingredients/:id`
- `DELETE /api/ingredients/:id`

- `GET /api/recipes`
- `GET /api/recipes/:id`
- `POST /api/recipes`
- `PUT /api/recipes/:id`
- `DELETE /api/recipes/:id`

- `GET /api/recipe-ingredients`
- `GET /api/recipe-ingredients/:id`
- `POST /api/recipe-ingredients`
- `PUT /api/recipe-ingredients/:id`
- `DELETE /api/recipe-ingredients/:id`

- `GET /api/inventory-imports`
- `GET /api/inventory-imports/:id`
- `POST /api/inventory-imports`
- `PUT /api/inventory-imports/:id`
- `DELETE /api/inventory-imports/:id`

- `GET /api/inventory-logs`
- `GET /api/inventory-logs/:id`
- `POST /api/inventory-logs`
- `PUT /api/inventory-logs/:id`
- `DELETE /api/inventory-logs/:id`
