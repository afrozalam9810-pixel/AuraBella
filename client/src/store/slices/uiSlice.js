import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mobileMenuOpen: false,
  searchOpen: false,
  cartDrawerOpen: false,
  toast: {
    message: "",
    type: "success",
    visible: false,
  },
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleMobileMenu(state) {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    setMobileMenu(state, action) {
      state.mobileMenuOpen = action.payload;
    },
    toggleSearch(state) {
      state.searchOpen = !state.searchOpen;
    },
    setSearch(state, action) {
      state.searchOpen = action.payload;
    },
    toggleCartDrawer(state) {
      state.cartDrawerOpen = !state.cartDrawerOpen;
    },
    setCartDrawer(state, action) {
      state.cartDrawerOpen = action.payload;
    },
    closeAll(state) {
      state.mobileMenuOpen = false;
      state.searchOpen = false;
      state.cartDrawerOpen = false;
    },
    showToast(state, action) {
      state.toast = {
        message: action.payload.message,
        type: action.payload.type || "success",
        visible: true,
      };
    },
    hideToast(state) {
      state.toast.visible = false;
    },
  },
});

export const {
  toggleMobileMenu,
  setMobileMenu,
  toggleSearch,
  setSearch,
  toggleCartDrawer,
  setCartDrawer,
  closeAll,
  showToast,
  hideToast,
} = uiSlice.actions;
export default uiSlice.reducer;
