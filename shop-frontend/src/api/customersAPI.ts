import shopApiClient from "./shopApiClient";

/**
 * Customers API for shop-frontend
 * Uses x-api-key header for authentication
 */
export const customersAPI = {
  getAll: async () => {
    const res = await shopApiClient.get("/customers");
    return res.data;
  },

  getById: async (id: number) => {
    const res = await shopApiClient.get(`/customers/${id}`);
    return res.data;
  },

  create: async (data: {
    name: string;
    phone: string;
    address?: string;
  }) => {
    const res = await shopApiClient.post("/customers", data);
    return res.data;
  },

  update: async (id: number, data: {
    name?: string;
    phone?: string;
    address?: string;
  }) => {
    const res = await shopApiClient.put(`/customers/${id}`, data);
    return res.data;
  },
};

export default customersAPI;