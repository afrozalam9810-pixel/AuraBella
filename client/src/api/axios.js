import axios from "axios";

/**
 * Custom axios instance for AuraBella.
 *
 * CSRF Protection:
 * For every state-mutating request (POST, PUT, PATCH, DELETE), the interceptor
 * automatically fetches a CSRF token from GET /api/csrf-token (cached in memory)
 * and injects it as the X-CSRF-Token header.
 *
 * Auto-retry: if the server returns a 403 CSRF error, the cached token is
 * cleared and the request is retried once with a fresh token.
 */

const MUTATING_METHODS = new Set(["post", "put", "patch", "delete"]);

// Module-level CSRF cache — persists for the lifetime of the tab
let csrfToken = null;
let csrfFetchPromise = null; // deduplicate concurrent fetches

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Fetch a fresh CSRF token from the server.
 * Deduplicates concurrent calls so only one HTTP request is made even if
 * multiple mutating requests fire simultaneously on page load.
 */
const fetchCsrfToken = async () => {
  if (csrfFetchPromise) return csrfFetchPromise;
  csrfFetchPromise = axios
    .get(`${BASE_URL}/csrf-token`, { withCredentials: true })
    .then((res) => {
      csrfToken = res.data?.csrfToken;
      return csrfToken;
    })
    .catch((err) => {
      console.warn("[CSRF] Could not fetch CSRF token:", err.message);
      return null;
    })
    .finally(() => {
      csrfFetchPromise = null; // allow future fetches
    });
  return csrfFetchPromise;
};

// ── Request interceptor — inject CSRF token on mutating calls ─────────────────
api.interceptors.request.use(async (config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const method = config.method?.toLowerCase();
  if (MUTATING_METHODS.has(method)) {
    if (!csrfToken) {
      await fetchCsrfToken();
    }
    if (csrfToken) {
      config.headers["X-CSRF-Token"] = csrfToken;
    }
  }
  return config;
});

// ── Response interceptor — auto-retry once on CSRF 403 ───────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const isCsrfError =
      error.response?.status === 403 &&
      error.response?.data?.message?.toLowerCase().includes("csrf");

    // Only retry once — avoid infinite loops
    if (isCsrfError && !error.config._csrfRetried) {
      csrfToken = null; // clear stale token
      await fetchCsrfToken(); // fetch fresh token

      if (csrfToken) {
        const retryConfig = {
          ...error.config,
          _csrfRetried: true,
          headers: {
            ...error.config.headers,
            "X-CSRF-Token": csrfToken,
          },
        };
        return axios(retryConfig); // retry original request
      }
    }

    return Promise.reject(error);
  }
);

export default api;
