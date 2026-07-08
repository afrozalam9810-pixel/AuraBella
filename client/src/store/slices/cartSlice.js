import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [], // Array of { product: { _id, name, price, discountPrice, images }, variant: { size, color }, qty, itemId }
  totalQty: 0,
  totalAmount: 0,
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
    // Add item (or increment qty if same product + variant exists)
    addToCart(state, action) {
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
        // Generate a mock unique itemId if not already present
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

    // Remove item by its combined itemId
    removeFromCart(state, action) {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item.itemId !== itemId);
      calculateTotals(state);
    },

    // Update item quantity
    updateQty(state, action) {
      const { itemId, qty } = action.payload;
      const item = state.items.find((i) => i.itemId === itemId);
      if (item) {
        item.qty = Math.max(1, qty);
      }
      calculateTotals(state);
    },

    // Clear whole cart
    clearCart(state) {
      state.items = [];
      state.totalQty = 0;
      state.totalAmount = 0;
    },

    // Set cart items directly (e.g. when fetching from DB cart on login)
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
    }
  },
});

export const { addToCart, removeFromCart, updateQty, clearCart, setCart } = cartSlice.actions;
export default cartSlice.reducer;
