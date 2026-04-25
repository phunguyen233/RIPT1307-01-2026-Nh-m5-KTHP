import axios from "./axiosClient";
import { InventoryImport } from "../types";

export const inventoryImportAPI = {
  getAll: async (): Promise<InventoryImport[]> => {
    const res = await axios.get("/inventory-imports");
    return res.data;
  },

  getById: async (id: number): Promise<InventoryImport> => {
    const res = await axios.get(`/inventory-imports/${id}`);
    return res.data;
  },

  getByIngredient: async (ingredientId: number): Promise<InventoryImport[]> => {
    const res = await axios.get(`/inventory-imports?ingredient_id=${ingredientId}`);
    return res.data;
  },

  create: async (payload: { ingredient_id: number; quantity: number; unit_id: number; import_price: number }): Promise<InventoryImport> => {
    const res = await axios.post("/inventory-imports", payload);
    return res.data;
  },

  update: async (id: number, payload: any): Promise<InventoryImport> => {
    const res = await axios.put(`/inventory-imports/${id}`, payload);
    return res.data;
  },

  delete: async (id: number) => {
    const res = await axios.delete(`/inventory-imports/${id}`);
    return res.data;
  }
};

export default inventoryImportAPI;
