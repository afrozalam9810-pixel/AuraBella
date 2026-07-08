/**
 * adminOrders.route.js
 * Routing for Admin-only Order APIs.
 * All routes are protected and restricted to administrators.
 */

const express = require("express");
const {
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");
const { protect } = require("../middleware/auth");
const { adminOnly } = require("../middleware/adminOnly");

const router = express.Router();

// Apply protection and admin authorization middleware to all routes
router.use(protect);
router.use(adminOnly);

router.route("/")
  .get(getAllOrders);

router.route("/:id/status")
  .put(updateOrderStatus);

module.exports = router;
