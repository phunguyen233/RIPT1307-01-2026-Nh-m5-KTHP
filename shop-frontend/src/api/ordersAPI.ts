import shopApiClient from "./shopApiClient";

/**
 * Orders API for shop-frontend
 * Uses x-api-key header for authentication
 */
export const ordersAPI = {
  getAll: async () => {
    const res = await shopApiClient.get("/orders");
    return res.data;
  },

  getById: async (id: number) => {
    const res = await shopApiClient.get(`/orders/${id}`);
    return res.data;
  },

  create: async (data: {
    customer_id?: number;
    shipping_address: string;
    total_price: number;
    items?: Array<{
      product_id: number;
      quantity: number;
      price: number;
    }>;
    order_items?: Array<{
      product_id: number;
      quantity: number;
      price: number;
    }>;
  }) => {
    // Backend accepts both 'items' and 'order_items' - use order_items for compatibility
    const payload = {
      customer_id: data.customer_id,
      shipping_address: data.shipping_address,
      total_price: data.total_price,
      order_items: data.order_items || data.items
    };
    const res = await shopApiClient.post("/orders", payload);
    return res.data;
  },

  updateStatus: async (id: number, status: string) => {
    const res = await shopApiClient.put(`/orders/${id}/status`, { status });
    return res.data;
  },
};

export default ordersAPI;