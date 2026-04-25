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

export interface Recipe {
  id: number;
  product_id: number;
  product_name?: string;
  created_at?: string;
}

export const recipeAPI = {
  // Recipes
  getAll: async (): Promise<Recipe[]> => {
    const res = await axios.get(`/recipes/`);
    return res.data;
  },
  create: async (payload: { product_id: number }): Promise<Recipe> => {
    const res = await axios.post(`/recipes/`, payload);
    return res.data;
  },
  getById: async (id: number): Promise<Recipe> => {
    const res = await axios.get(`/recipes/${id}`);
    return res.data;
  },
  update: async (id: number, payload: { product_id: number }): Promise<Recipe> => {
    const res = await axios.put(`/recipes/${id}`, payload);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await axios.delete(`/recipes/${id}`);
    return res.data;
  },
  
  // Recipe ingredients
  getIngredientsByRecipe: async (recipe_id: number): Promise<RecipeIngredient[]> => {
    const res = await axios.get(`/recipe-ingredients/?recipe_id=${recipe_id}`);
    return res.data;
  },
  addIngredient: async (payload: { recipe_id: number; ingredient_id: number; quantity: number; unit_id?: number }): Promise<RecipeIngredient> => {
    const res = await axios.post(`/recipe-ingredients/`, payload);
    return res.data;
  },
  updateIngredient: async (id: number, payload: { ingredient_id: number; quantity: number; unit_id?: number }): Promise<RecipeIngredient> => {
    const res = await axios.put(`/recipe-ingredients/${id}`, payload);
    return res.data;
  },
  deleteIngredient: async (id: number) => {
    const res = await axios.delete(`/recipe-ingredients/${id}`);
    return res.data;
  }
};

export default recipeAPI;
