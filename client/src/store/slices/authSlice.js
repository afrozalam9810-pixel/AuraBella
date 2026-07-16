import { createSlice } from "@reduxjs/toolkit";
import { resetHydration } from "../../hooks/useAppHydration";

const getStoredAuth = () => {
  if (typeof window === "undefined") return { user: null, token: null };

  try {
    return {
      user: JSON.parse(localStorage.getItem("aurabella-user") || "null"),
      token: localStorage.getItem("token"),
    };
  } catch (_) {
    return { user: null, token: null };
  }
};

const storedAuth = getStoredAuth();

const initialState = {
  user: storedAuth.user,
  token: storedAuth.token,
  isAuthenticated: Boolean(storedAuth.user && storedAuth.token),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = Boolean(user && token);
      state.error = null;

      if (typeof window !== "undefined") {
        if (token) localStorage.setItem("token", token);
        else localStorage.removeItem("token");
        if (user) localStorage.setItem("aurabella-user", JSON.stringify(user));
        else localStorage.removeItem("aurabella-user");
      }
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;

      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("aurabella-user");
      }

      // Allow next login to re-hydrate cart & wishlist from backend
      resetHydration();
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const { setCredentials, logout, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;
