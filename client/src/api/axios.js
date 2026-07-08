import axios from "axios";

/**
 * Custom axios instance for AuraBella.
 * Handles the backend baseURL configuration and sets withCredentials to true
 * to support cookie-based HTTP-Only JWT authentication.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
