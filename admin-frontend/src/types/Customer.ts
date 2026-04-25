export interface Customer {
  id?: number;
  customer_code?: string;
  user_id?: number | null;
  name: string;
  phone?: string;
  address?: string;
  total_spent?: number;
  shop_id?: number;
  created_at?: string;
}
