/**
 * orders.route.js
 * Routing for Customer Order APIs.
 * All routes are protected.
 */

const express = require("express");
const {
  createOrder,
  getMyOrders,
  getOrderById,
  validateCoupon,
} = require("../controllers/orderController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Apply protection middleware to all order routes
router.use(protect);

router.route("/")
  .get(getMyOrders)
  .post(createOrder);

router.post("/validate-coupon", validateCoupon);

router.route("/:id")
  .get(getOrderById);

module.exports = router;
