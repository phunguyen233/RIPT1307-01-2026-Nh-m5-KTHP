export interface Product {
  id?: number;
  product_code?: string;
  name: string;
  price: number;
  cost_price?: number;
  description?: string;
  image_url?: string;
  category_id?: number;
  is_active?: boolean;
  created_at?: string;
  image_base64?: string;
}

// Keep old interface for backward compatibility
export interface ProductOld {
  ma_san_pham: number;
  ten_san_pham: string;
  gia_ban: number;
  so_luong_ton: number;
  hinh_anh?: string;
  trang_thai?: string;
  mo_ta?: string;
}
