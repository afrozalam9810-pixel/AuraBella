const express = require("express");
const { createPaymentOrder, verifyPaymentSignature, notifyPaymentFailure } = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const orderSchemas = require("../schemas/order.schemas");

const router = express.Router();

router.use(protect);

router.post("/create-order", validate(orderSchemas.createPaymentOrder), createPaymentOrder);
router.post("/verify", validate(orderSchemas.verifyPaymentSignature), verifyPaymentSignature);
router.post("/fail", notifyPaymentFailure);

module.exports = router;
