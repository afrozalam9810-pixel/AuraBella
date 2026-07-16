import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// Async thunk to fetch cart from backend
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { dispatch }) => {
    try {
      const { data } = await api.get("/cart");
      if (data && data.success) {
        dispatch(setCart(data.data.items || []));
      }
    } catch (err) {
      console.error("Failed to fetch cart", err);
    }
  }
);

// Thunk to add to cart
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ product, variant, qty = 1 }, { dispatch, getState }) => {
    const { auth } = getState();
    if (auth.isAuthenticated) {
      try {
        const { data } = await api.post("/cart", {
          productId: product._id,
          variant,
          qty,
        });
        if (data && data.success) {
          dispatch(setCart(data.data.items || []));
        }
      } catch (err) {
        console.error("Failed to add to cart on server", err);
        // Fallback to local update
        dispatch(addToCartLocal({ product, variant, qty }));
      }
    } else {
      dispatch(addToCartLocal({ product, variant, qty }));
    }
  }
);

// Thunk to remove from cart
export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (itemId, { dispatch, getState }) => {
    const { auth } = getState();
    if (auth.isAuthenticated) {
      try {
        const { data } = await api.delete(`/cart/${itemId}`);
        if (data && data.success) {
          dispatch(setCart(data.data.items || []));
        }
      } catch (err) {
        console.error("Failed to remove from cart on server", err);
        // Fallback to local update
        dispatch(removeFromCartLocal(itemId));
      }
    } else {
      dispatch(removeFromCartLocal(itemId));
    }
  }
);

// Thunk to update quantity
export const updateQty = createAsyncThunk(
  "cart/updateQty",
  async ({ itemId, qty }, { dispatch, getState }) => {
    const { auth } = getState();
    if (auth.isAuthenticated) {
      try {
        const { data } = await api.put(`/cart/${itemId}`, { qty });
        if (data && data.success) {
          dispatch(setCart(data.data.items || []));
        }
      } catch (err) {
        console.error("Failed to update qty on server", err);
        // Fallback to local update
        dispatch(updateQtyLocal({ itemId, qty }));
      }
    } else {
      dispatch(updateQtyLocal({ itemId, qty }));
    }
  }
);

// Thunk to clear cart
export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { dispatch, getState }) => {
    const { auth } = getState();
    if (auth.isAuthenticated) {
      try {
        const { data } = await api.delete("/cart");
        if (data && data.success) {
          dispatch(setCart([]));
        }
      } catch (err) {
        console.error("Failed to clear cart on server", err);
        dispatch(clearCartLocal());
      }
    } else {
      dispatch(clearCartLocal());
    }
  }
);

const initialState = {
  items: [], // Array of { product: { _id, name, price, discountPrice, images }, variant: { size, color }, qty, itemId }
  totalQty: 0,
  totalAmount: 0,
  loading: false,
};

const calculateTotals = (state) => {
  let qty = 0;
  let amount = 0;

  state.items.forEach((item) => {
    const price = item.product.discountPrice ?? item.product.price;
    qty += item.qty;
    amount += price * item.qty;
  });

  state.totalQty = qty;
  state.totalAmount = parseFloat(amount.toFixed(2));
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCartLocal(state, action) {
      const { product, variant, qty = 1 } = action.payload;
      
      const existingItem = state.items.find(
        (item) =>
          item.product._id === product._id &&
          item.variant.size === (variant.size || "") &&
          item.variant.color === (variant.color || "")
      );

      if (existingItem) {
        existingItem.qty += qty;
      } else {
        const itemId = `${product._id}-${variant.size || "none"}-${variant.color || "none"}`;
        state.items.push({
          product,
          variant: {
            size: variant.size || "",
            color: variant.color || "",
          },
          qty,
          itemId,
        });
      }

      calculateTotals(state);
    },

    removeFromCartLocal(state, action) {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item.itemId !== itemId);
      calculateTotals(state);
    },

    updateQtyLocal(state, action) {
      const { itemId, qty } = action.payload;
      const item = state.items.find((i) => i.itemId === itemId);
      if (item) {
        item.qty = Math.max(1, qty);
      }
      calculateTotals(state);
    },

    clearCartLocal(state) {
      state.items = [];
      state.totalQty = 0;
      state.totalAmount = 0;
    },

    setCart(state, action) {
      state.items = action.payload.map(item => {
        return {
          product: item.product,
          variant: item.variant,
          qty: item.qty,
          itemId: item._id || `${item.product._id}-${item.variant.size || "none"}-${item.variant.color || "none"}`
        };
      });
      calculateTotals(state);
    },
    setCartLoading(state, action) {
      state.loading = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchCart.rejected, (state) => {
        state.loading = false;
      });
  }
});

export const { addToCartLocal, removeFromCartLocal, updateQtyLocal, clearCartLocal, setCart, setCartLoading } = cartSlice.actions;
export default cartSlice.reducer;
