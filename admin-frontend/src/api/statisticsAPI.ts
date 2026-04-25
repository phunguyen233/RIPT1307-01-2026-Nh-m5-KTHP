import axios from "./axiosClient";
import { Statistics } from "../types";

export const statisticsAPI = {
  getDashboard: async (): Promise<Statistics> => {
    const res = await axios.get("/statistics/dashboard");
    return res.data;
  },

  getRevenue: async (period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<any> => {
    const res = await axios.get(`/statistics/revenue?period=${period}`);
    return res.data;
  },

  getTopProducts: async (limit: number = 10): Promise<any[]> => {
    const res = await axios.get(`/statistics/top-products?limit=${limit}`);
    return res.data;
  },

  getCustomerStats: async (): Promise<any> => {
    const res = await axios.get("/statistics/customers");
    return res.data;
  },

  getInventoryValue: async (): Promise<number> => {
    const res = await axios.get("/statistics/inventory-value");
    return res.data;
  }
};

export default statisticsAPI;
