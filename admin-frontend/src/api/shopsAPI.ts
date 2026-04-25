import axiosClient from "./axiosClient";

const endpoint = "/shops";

export const shopsAPI = {
  getAllShops: async () => {
    const res = await axiosClient.get(endpoint);
    return res.data;
  },

  getShopById: async (id: number) => {
    const res = await axiosClient.get(`${endpoint}/${id}`);
    return res.data;
  },

  createShop: async (payload: { name: string; email: string | null; api_key: string }) => {
    const res = await axiosClient.post(endpoint, payload);
    return res.data;
  },

  updateShop: async (id: number, payload: { name: string; email: string }) => {
    const res = await axiosClient.put(`${endpoint}/${id}`, payload);
    return res.data;
  },

  deleteShop: async (id: number) => {
    const res = await axiosClient.delete(`${endpoint}/${id}`);
    return res.data;
  },
};

export default shopsAPI;
