import axios from "./axiosClient";

export interface Unit {
  id?: number;
  name: string;
  symbol: string;
  type: 'weight' | 'volume' | 'unit';
  base_unit_id?: number | null;
  conversion_factor: number;
  created_at?: string;
}

export const unitAPI = {
  getAll: async (): Promise<Unit[]> => {
    const res = await axios.get(`/units/`);
    return res.data;
  },
  getById: async (id: number): Promise<Unit> => {
    const res = await axios.get(`/units/${id}`);
    return res.data;
  },
  add: async (payload: { name: string; symbol: string; type: string; base_unit_id?: number | null; conversion_factor: number }): Promise<Unit> => {
    const res = await axios.post(`/units/`, payload);
    return res.data;
  },
  update: async (id: number, payload: { name: string; symbol: string; type: string; base_unit_id?: number | null; conversion_factor: number }): Promise<Unit> => {
    const res = await axios.put(`/units/${id}`, payload);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await axios.delete(`/units/${id}`);
    return res.data;
  },
};
