import shopApiClient from "./shopApiClient";

/**
 * Products API for shop-frontend
 * Uses x-api-key header for authentication
 */
export const productsAPI = {
  getAll: async () => {
    const res = await shopApiClient.get("/products");
    return res.data;
  },

  getById: async (id: number) => {
    const res = await shopApiClient.get(`/products/${id}`);
    return res.data;
  },

  getByShop: async (shopId: number) => {
    const res = await shopApiClient.get(`/products?shop_id=${shopId}`);
    return res.data;
  },
};

export default productsAPI;