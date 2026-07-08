const express = require("express");
const { getCoupons, createCoupon, deleteCoupon } = require("../controllers/couponController");
const { protect } = require("../middleware/auth");
const { adminOnly } = require("../middleware/adminOnly");

const router = express.Router();

// Apply protection and admin check to all coupon routes
router.use(protect);
router.use(adminOnly);

router.route("/")
  .get(getCoupons)
  .post(createCoupon);

router.route("/:id")
  .delete(deleteCoupon);

module.exports = router;
