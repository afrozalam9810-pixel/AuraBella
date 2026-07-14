/**
 * push.route.js
 * Web Push subscription and admin broadcast endpoints.
 */
const express = require("express");
const { subscribe, unsubscribe, broadcastFlashSale } = require("../controllers/pushController");
const { protect } = require("../middleware/auth");
const { adminOnly } = require("../middleware/adminOnly");

const router = express.Router();

// Public (no auth required — anonymous subscribers allowed)
router.post("/subscribe",    subscribe);
router.post("/unsubscribe",  unsubscribe);

// Admin broadcast
router.post("/admin/broadcast", protect, adminOnly, broadcastFlashSale);

module.exports = router;
