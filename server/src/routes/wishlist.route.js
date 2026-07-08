/**
 * wishlist.route.js
 * Routing for Wishlist APIs.
 * All routes are protected.
 */

const express = require("express");
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require("../controllers/wishlistController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Apply protection middleware to all wishlist routes
router.use(protect);

router.route("/")
  .get(getWishlist);

router.route("/:productId")
  .post(addToWishlist)
  .delete(removeFromWishlist);

module.exports = router;
