import axios from "./axiosClient";

export interface RecipeIngredient {
  id: number;
  recipe_id: number;
  ingredient_id: number;
  ingredient_name?: string;
  quantity: number;
  unit_id: number;
  unit_symbol?: string;
  product_id?: number;
}

export const recipeIngredientsAPI = {
  getAll: async (): Promise<RecipeIngredient[]> => {
    const res = await axios.get(`/recipe-ingredients/`);
    return res.data;
  },
  getById: async (id: number): Promise<RecipeIngredient> => {
    const res = await axios.get(`/recipe-ingredients/${id}`);
    return res.data;
  },
  create: async (payload: { recipe_id: number; ingredient_id: number; quantity: number; unit_id?: number }): Promise<RecipeIngredient> => {
    const res = await axios.post(`/recipe-ingredients/`, payload);
    return res.data;
  },
  update: async (id: number, payload: { ingredient_id: number; quantity: number; unit_id?: number }): Promise<RecipeIngredient> => {
    const res = await axios.put(`/recipe-ingredients/${id}`, payload);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await axios.delete(`/recipe-ingredients/${id}`);
    return res.data;
  }
};

export default recipeIngredientsAPI;
