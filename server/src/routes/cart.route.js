/**
 * cart.route.js
 * Routing for Cart APIs.
 * All routes are protected.
 */

const express = require("express");
const {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
} = require("../controllers/cartController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Apply protection middleware to all cart routes
router.use(protect);

router.route("/")
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

router.route("/:itemId")
  .put(updateCartItemQuantity)
  .delete(removeCartItem);

module.exports = router;
