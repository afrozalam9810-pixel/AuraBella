const express = require("express");
const { getAdminStats } = require("../controllers/adminStatsController");
const { getAbandonedCarts } = require("../controllers/abandonedCartController");
const { exportOrders, exportCustomers } = require("../controllers/exportController");
const { getGSTReport, getCategoryRevenueReport } = require("../controllers/reportsController");
const { protect } = require("../middleware/auth");
const { adminOnly } = require("../middleware/adminOnly");

const router = express.Router();

// All routes are admin-only
router.use(protect, adminOnly);

// General admin stats
router.get("/", getAdminStats);

// Abandoned cart analytics
router.get("/analytics/abandoned-carts", getAbandonedCarts);

// CSV Data exports
router.get("/export/orders",    exportOrders);
router.get("/export/customers", exportCustomers);

// Reports
router.get("/reports/gst",               getGSTReport);
router.get("/reports/category-revenue",  getCategoryRevenueReport);

module.exports = router;
