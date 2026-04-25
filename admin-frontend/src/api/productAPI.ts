import axiosClient from "./axiosClient";
import { Product } from "../types/Product";

export const productAPI = {
  getAll: async (): Promise<Product[]> => {
    const res = await axiosClient.get("/products");
    return res.data;
  },

  getById: async (id: number): Promise<Product> => {
    const res = await axiosClient.get(`/products/${id}`);
    return res.data;
  },

  // Create product without image
  create: async (data: Product) => {
    const res = await axiosClient.post("/products", data);
    return res.data;
  },

  // Create product with image (base64)
  createWithImage: async (data: any) => {
    const res = await axiosClient.post("/products/with-image", {
      name: data.name,
      price: data.price,
      cost_price: data.cost_price,
      description: data.description,
      category_id: data.category_id,
      is_active: data.is_active !== false,
      image_base64: data.image_base64, // Base64 encoded image
    });
    return res.data;
  },

  // Update product without image
  update: async (id: number, data: Product) => {
    const res = await axiosClient.put(`/products/${id}`, data);
    return res.data;
  },

  // Update product with image (base64)
  updateWithImage: async (id: number, data: any) => {
    const res = await axiosClient.put(`/products/${id}/with-image`, {
      name: data.name,
      price: data.price,
      cost_price: data.cost_price,
      description: data.description,
      category_id: data.category_id,
      is_active: data.is_active !== false,
      image_base64: data.image_base64, // Base64 encoded image
      old_image_url: data.old_image_url, // Previous image URL for reference
    });
    return res.data;
  },

  delete: async (id: number) => {
    const res = await axiosClient.delete(`/products/${id}`);
    return res.data;
  },

  toggle: async (id: number) => {
    const res = await axiosClient.patch(`/products/${id}/toggle`);
    return res.data;
  },
};

// Utility function to convert file to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};
