import axiosClient from "./axiosClient";

const endpoint = "/users";

export const authAPI = {
  // Register admin account
  registerAdmin: async (payload: { name: string; email: string; password: string; shop_name: string; shop_email?: string }) => {
    const res = await axiosClient.post(`${endpoint}/register/admin`, payload);
    return res.data;
  },

  // Login
  login: async (payload: { email: string; password: string }) => {
    const res = await axiosClient.post(`${endpoint}/login`, payload);
    return res.data;
  },

  // Register customer (for shop frontend/app)
  register: async (payload: { name: string; email: string; password: string; shop_id?: number; api_key?: string }) => {
    const res = await axiosClient.post(`${endpoint}/register`, payload);
    return res.data;
  },
};

export default authAPI;
