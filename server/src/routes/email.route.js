/**
 * email.route.js
 * Routing for admin campaign notifications and logging operations.
 */

const express = require("express");
const { sendManualCampaignEmail, getEmailLogs, retryEmailLog } = require("../controllers/emailController");
const { protect } = require("../middleware/auth");
const { adminOnly } = require("../middleware/adminOnly");

const router = express.Router();

router.use(protect);
router.use(adminOnly);

// Route dispatches
router.post("/send", sendManualCampaignEmail);
router.get("/logs", getEmailLogs);
router.post("/logs/:id/retry", retryEmailLog);

module.exports = router;
