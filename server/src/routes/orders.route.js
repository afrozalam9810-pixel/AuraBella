const express = require("express");
const {
  createOrder,
  createGuestOrder,
  getMyOrders,
  getOrderById,
  validateCoupon,
} = require("../controllers/orderController");
const { protect } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const orderSchemas = require("../schemas/order.schemas");

const router = express.Router();

// Public checkout endpoint for guests (does NOT require protect middleware)
router.post("/guest", validate(orderSchemas.createGuestOrder), createGuestOrder);

// Apply protection middleware to all standard user order routes
router.use(protect);

router.route("/")
  .get(getMyOrders)
  .post(validate(orderSchemas.createOrder), createOrder);

router.post("/validate-coupon", validate(orderSchemas.validateCoupon), validateCoupon);

router.route("/:id")
  .get(getOrderById);

module.exports = router;
