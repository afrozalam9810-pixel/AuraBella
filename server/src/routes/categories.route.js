/**
 * categories.route.js
 * Routing for Category APIs.
 */

const express = require("express");
const { getCategories, createCategory, updateCategory, deleteCategory } = require("../controllers/categoryController");
const { protect } = require("../middleware/auth");
const { adminOnly } = require("../middleware/adminOnly");

const router = express.Router();

router.get("/", getCategories);

// Admin-only endpoints
router.post("/", protect, adminOnly, createCategory);
router.put("/:id", protect, adminOnly, updateCategory);
router.delete("/:id", protect, adminOnly, deleteCategory);

module.exports = router;
