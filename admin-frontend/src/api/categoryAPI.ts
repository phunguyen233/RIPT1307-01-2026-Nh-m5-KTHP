import axiosClient from "./axiosClient";

export interface Category {
  id?: number;
  name: string;
}

export const categoryAPI = {
  getAll: async (): Promise<Category[]> => {
    const res = await axiosClient.get("/categories");
    return res.data;
  },

  getById: async (id: number): Promise<Category> => {
    const res = await axiosClient.get(`/categories/${id}`);
    return res.data;
  },

  create: async (data: Category): Promise<Category> => {
    const res = await axiosClient.post("/categories", data);
    return res.data;
  },

  update: async (id: number, data: Category): Promise<Category> => {
    const res = await axiosClient.put(`/categories/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosClient.delete(`/categories/${id}`);
  },
};
