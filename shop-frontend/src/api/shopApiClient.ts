import axios from "axios";

// API key được cấu hình trong file .env hoặc biến môi trường
// REACT_APP_SHOP_API_KEY=your_api_key_here
export const API_KEY = process.env.REACT_APP_SHOP_API_KEY || "";
const API_BASE_URL = process.env.REACT_APP_SHOP_API_URL || "http://localhost:4000/api";

/**
 * API client for shop-frontend
 * Uses x-api-key header for authentication
 */
const shopApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
  },
});

// Handle response errors
shopApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Invalid API key - please check REACT_APP_SHOP_API_KEY");
    }
    return Promise.reject(error);
  }
);

export default shopApiClient;