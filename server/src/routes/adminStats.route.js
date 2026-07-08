const express = require("express");
const { getAdminStats } = require("../controllers/adminStatsController");
const { protect } = require("../middleware/auth");
const { adminOnly } = require("../middleware/adminOnly");

const router = express.Router();

router.route("/")
  .get(protect, adminOnly, getAdminStats);

module.exports = router;
