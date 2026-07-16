import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// Async thunk to fetch wishlist
export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/wishlist");
      if (data && data.success) {
        return data.data || [];
      }
      return [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load wishlist");
    }
  }
);

// Async thunk to add to wishlist
export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async (product, { rejectWithValue }) => {
    try {
      await api.post(`/wishlist/${product._id}`);
      return product;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to add to wishlist");
    }
  }
);

// Async thunk to remove from wishlist
export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async (productId, { rejectWithValue }) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      return productId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to remove from wishlist");
    }
  }
);

const initialState = {
  items: [], // Array of populated product objects
  loading: false,
  error: null,
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    clearWishlist(state) {
      state.items = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add to Wishlist
      .addCase(addToWishlist.fulfilled, (state, action) => {
        const product = action.payload;
        if (!state.items.some((item) => item._id === product._id)) {
          state.items.push(product);
        }
      })
      // Remove from Wishlist
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        const productId = action.payload;
        state.items = state.items.filter((item) => item._id !== productId);
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
