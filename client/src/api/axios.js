import axios from "axios";

/**
 * Custom axios instance for AuraBella.
 * Handles the backend baseURL configuration and sets withCredentials to true
 * to support cookie-based HTTP-Only JWT authentication.
 *
 * CSRF Protection:
 * For every state-mutating request (POST, PUT, PATCH, DELETE), the interceptor
 * automatically fetches a CSRF token from GET /api/csrf-token (once per session,
 * then cached) and injects it as the X-CSRF-Token header.
 */

const MUTATING_METHODS = ["post", "put", "patch", "delete"];

let csrfToken = null;

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.VITE_API_BASE_URL ||
    "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — inject CSRF token on mutating calls
api.interceptors.request.use(async (config) => {
  const method = config.method?.toLowerCase();
  if (MUTATING_METHODS.includes(method)) {
    if (!csrfToken) {
      try {
        // Fetch the token using a plain axios call (not api instance — avoids infinite loop)
        const res = await axios.get(
          `${config.baseURL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api"}/csrf-token`,
          { withCredentials: true }
        );
        csrfToken = res.data?.csrfToken;
      } catch (err) {
        console.warn("[CSRF] Could not fetch CSRF token:", err.message);
      }
    }
    if (csrfToken) {
      config.headers["X-CSRF-Token"] = csrfToken;
    }
  }
  return config;
});

// Response interceptor — if a 403 CSRF error comes back, clear cached token so next request re-fetches
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 403 &&
      error.response?.data?.message?.includes("CSRF")
    ) {
      csrfToken = null; // reset so it gets re-fetched
    }
    return Promise.reject(error);
  }
);

export default api;
