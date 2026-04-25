import axios from "./axiosClient";

export interface InventoryImport {
  id: number;
  ingredient_id: number;
  ingredient_name?: string;
  quantity: number;
  unit_id: number;
  unit_symbol?: string;
  import_price: number;
  shop_id: number;
  created_at?: string;
}

export const receiptAPI = {
  add: async (ingredient_id: number, payload: { quantity: number; unit_id: number; import_price: number }): Promise<InventoryImport> => {
    const res = await axios.post(`/inventory-imports/`, { 
      ingredient_id, 
      ...payload 
    });
    return res.data;
  },
  getAll: async (): Promise<InventoryImport[]> => {
    const res = await axios.get(`/inventory-imports/`);
    return res.data;
  },
  getById: async (id: number): Promise<InventoryImport> => {
    const res = await axios.get(`/inventory-imports/${id}`);
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

export default receiptAPI;
