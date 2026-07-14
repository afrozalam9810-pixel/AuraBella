/**
 * Wishlist.model.js
 * Standalone wishlist collection — one document per user.
 *
 * Moving wishlist out of the User document:
 *  ✓ Keeps User document lean and fast to deserialize on login
 *  ✓ Supports unlimited wishlist items without bloating the user record
 *  ✓ Enables efficient per-product wishlist count aggregations
 *
 * Schema:
 *  user    — ref to the owning User (unique, one doc per user)
 *  items   — array of Product ObjectId references
 */

const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      unique:   true,  // one wishlist document per user
      index:    true,
    },
    items: [
      {
        product: {
          type:     mongoose.Schema.Types.ObjectId,
          ref:      "Product",
          required: true,
        },
        addedAt: {
          type:    Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// Compound index for fast product lookup inside a user's wishlist
wishlistSchema.index({ user: 1, "items.product": 1 });

const Wishlist = mongoose.model("Wishlist", wishlistSchema);
module.exports = Wishlist;
