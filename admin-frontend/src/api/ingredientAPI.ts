import axios from "./axiosClient";

export interface Ingredient {
  id: number;
  name: string;
  unit_id: number;
  unit_name?: string;
  unit_symbol?: string;
  shop_id: number;
  stock_quantity: number;
  avg_price: number;
  created_at?: string;
}

export const ingredientAPI = {
  getAll: async (): Promise<Ingredient[]> => {
    const res = await axios.get(`/ingredients/`);
    return res.data;
  },
  add: async (payload: { name: string; unit_id: number; stock_quantity?: number }): Promise<Ingredient> => {
    const res = await axios.post(`/ingredients/`, payload);
    return res.data;
  },
  getById: async (id: number): Promise<Ingredient> => {
    const res = await axios.get(`/ingredients/${id}`);
    return res.data;
  },
  update: async (id: number, payload: { name: string; unit_id: number; stock_quantity?: number }): Promise<Ingredient> => {
    const res = await axios.put(`/ingredients/${id}`, payload);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await axios.delete(`/ingredients/${id}`);
    return res.data;
  }
};

export default ingredientAPI;
