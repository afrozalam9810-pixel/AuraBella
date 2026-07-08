import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import uiReducer from "./slices/uiSlice";

/**
 * Configure Redux Store with combined slices.
 * auth: handles user profiles and authentication state.
 * cart: handles local state cart operations.
 * ui: handles drawer states and dynamic interactions.
 */
const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    ui: uiReducer,
  },
});

export default store;
