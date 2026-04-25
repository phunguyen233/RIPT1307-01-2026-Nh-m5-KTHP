import axiosClient from "./axiosClient";

export const inventoryAPI = {
  getCurrent: async () => {
    const res = await axiosClient.get("/inventory/current");
    return res.data;
  },
  getHistory: async () => {
    const res = await axiosClient.get("/inventory/history");
    return res.data;
  },
  getAsOf: async (date: string) => {
    const res = await axiosClient.get("/inventory/asof", { params: { date } });
    return res.data;
  },
};

export default inventoryAPI;
