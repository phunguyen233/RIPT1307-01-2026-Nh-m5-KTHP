// === SHOPS ===
export interface Shop {
  id: number;
  name: string;
  email?: string;
  api_key: string;
  created_at?: string;
}

// === USERS ===
export interface User {
  id: number;
  name: string;
  email?: string;
  password?: string;
  role: 'admin' | 'staff' | 'customer';
  shop_id?: number;
  created_at?: string;
}

// === CUSTOMERS ===
export interface Customer {
  id: number;
  user_id?: number;
  name: string;
  phone: string;
  address?: string;
  total_spent: number;
  shop_id: number;
  created_at?: string;
}

// === UNITS ===
export interface Unit {
  id: number;
  name: string;
  symbol: string;
  type: 'weight' | 'volume' | 'unit';
  base_unit_id?: number;
  conversion_factor: number;
  created_at?: string;
}

// === CATEGORIES ===
export interface Category {
  id: number;
  name: string;
  shop_id: number;
}

// === PRODUCTS ===
export interface Product {
  id?: number;
  name: string;
  price: number;
  cost_price?: number;
  description?: string;
  image_url?: string;
  category_id?: number;
  shop_id?: number;
  is_active?: boolean;
  created_at?: string;
}

// === INGREDIENTS ===
export interface Ingredient {
  id: number;
  name: string;
  unit_id: number;
  shop_id: number;
  stock_quantity: number;
  created_at?: string;
  unit_symbol?: string;
  unit_name?: string;
}

// === RECIPES ===
export interface Recipe {
  id: number;
  product_id: number;
  product_name?: string;
  created_at?: string;
}

// === RECIPE INGREDIENTS ===
export interface RecipeIngredient {
  id: number;
  recipe_id: number;
  ingredient_id: number;
  ingredient_name?: string;
  quantity: number;
  unit_id?: number;
  unit_symbol?: string;
  created_at?: string;
}

// === ORDERS ===
export interface Order {
  id: number;
  customer_id: number;
  shop_id: number;
  shipping_address: string;
  total_price: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at?: string;
  customer_name?: string;
  customer_phone?: string;
}

// === ORDER ITEMS ===
export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  created_at?: string;
  product_name?: string;
}

// === INVENTORY IMPORTS ===
export interface InventoryImport {
  id: number;
  ingredient_id: number;
  quantity: number;
  unit_id: number;
  import_price: number;
  shop_id: number;
  created_at?: string;
  ingredient_name?: string;
  unit_symbol?: string;
}

// === INVENTORY LOGS ===
export interface InventoryLog {
  id: number;
  ingredient_id: number;
  change_type: 'import' | 'export' | 'adjust';
  quantity: number;
  note?: string;
  shop_id: number;
  created_at?: string;
  ingredient_name?: string;
}

// === STATISTICS ===
export interface Statistics {
  total_revenue: number;
  total_orders: number;
  total_profit: number;
  monthly_revenue: Array<{ month: string; revenue: number }>;
  top_products: Array<{ name: string; quantity: number; revenue: number }>;
}
