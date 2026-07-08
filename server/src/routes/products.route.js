/**
 * products.route.js
 * Routing for Product APIs.
 */

const express = require("express");
const {
  getProducts,
  getProductById,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { protect } = require("../middleware/auth");
const { adminOnly } = require("../middleware/adminOnly");

// Import nested review router
const reviewRouter = require("./reviews.route");

const router = express.Router();

// Product endpoints
router.get("/", getProducts);
router.get("/search", searchProducts); // Must be defined BEFORE /:id
router.get("/:id", getProductById);

// Admin-only endpoints
router.post("/", protect, adminOnly, createProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

// Re-route into review router
router.use("/:id/reviews", reviewRouter);

module.exports = router;
