/**
 * banners.route.js
 * Public read + Admin CRUD for promotional banners.
 */
const express = require("express");
const { getBanners, adminGetBanners, createBanner, updateBanner, deleteBanner } = require("../controllers/bannerController");
const { protect } = require("../middleware/auth");
const { adminOnly } = require("../middleware/adminOnly");
const router = express.Router();
router.get("/", getBanners);
router.use(protect, adminOnly);
router.get("/admin", adminGetBanners);
router.post("/", createBanner);
router.put("/:id", updateBanner);
router.delete("/:id", deleteBanner);
module.exports = router;
