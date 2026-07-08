const express = require("express");
const { createPaymentOrder, verifyPaymentSignature } = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.post("/create-order", createPaymentOrder);
router.post("/verify", verifyPaymentSignature);

module.exports = router;
