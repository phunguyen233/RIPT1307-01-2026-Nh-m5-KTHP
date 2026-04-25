import axiosClient from "./axiosClient";
import type { Customer } from "../types/Customer";

export type { Customer };

export const customerAPI = {
  getAll: async (): Promise<Customer[]> => {
    const res = await axiosClient.get("/customers");
    return res.data;
  },
  create: async (data: Customer) => {
    const res = await axiosClient.post("/customers", data);
    return res.data;
  },
  update: async (id: number, data: Customer) => {
    const res = await axiosClient.put(`/customers/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await axiosClient.delete(`/customers/${id}`);
    return res.data;
  },
  getOrders: async (id: number) => {
    const res = await axiosClient.get(`/customers/${id}/orders`);
    return res.data;
  }
};
