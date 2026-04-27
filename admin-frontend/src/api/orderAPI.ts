import axiosClient from "./axiosClient";

export interface OrderItem {
  id?: number;
  order_id?: number;
  product_id: number;
  quantity: number;
  price: number;
  name?: string;
}

export interface Order {
  id?: number;
  order_code?: string;
  customer_id?: number;
  shop_id?: number;
  shipping_address?: string;
  total_price?: number;
  status?: 'pending' | 'completed' | 'cancelled';
  created_at?: string;
  order_items?: OrderItem[];
  items?: OrderItem[]; // for backward compatibility
  customer_name?: string;
  customer_phone?: string;
}

const endpoint = "/orders";

export const orderAPI = {
  getAll: async (): Promise<Order[]> => {
    const res = await axiosClient.get(endpoint);
    return res.data;
  },
  getById: async (id: number): Promise<Order> => {
    const res = await axiosClient.get(`${endpoint}/${id}`);
    return res.data;
  },
  create: async (payload: { customer_id: number | null; shipping_address: string; total_price: number; status?: string; order_items: { product_id: number; quantity: number; price: number }[] }) => {
    const res = await axiosClient.post(endpoint, payload);
    return res.data;
  },
  search: async (q: string) => {
    const res = await axiosClient.get(`${endpoint}/search`, { params: { q } });
    return res.data;
  },
  delete: async (id: number) => {
    const res = await axiosClient.delete(`${endpoint}/${id}`);
    return res.data;
  },
  updateStatus: async (id: number, trang_thai: string, tien_ship?: number, packagedItems?: any[], voucherType?: 'amount' | 'percent', voucherValue?: number) => {
    const url = `${endpoint}/${id}/status`;
    const payload: any = { trang_thai };
    if (typeof tien_ship === 'number') payload.tien_ship = tien_ship;
    if (Array.isArray(packagedItems) && packagedItems.length > 0) payload.packaged_items = packagedItems;
    if (voucherType && typeof voucherValue !== 'undefined') {
      // prefer explicit type+value; backend will compute so_tien_giam
      payload.voucher_type = voucherType;
      payload.voucher_value = voucherValue;
    }
    console.debug('orderAPI.updateStatus ->', url, payload);
    const res = await axiosClient.put(url, payload);
    return res.data;
  },
};

export default orderAPI;
