/**
 * reviews.route.js
 * Routing for Review APIs.
 * Note: uses mergeParams: true to inherit the product ID from products router.
 */

const express = require("express");
const {
  addOrUpdateReview,
  getProductReviews,
} = require("../controllers/reviewController");
const { protect } = require("../middleware/auth");

const router = express.Router({ mergeParams: true });

router.route("/")
  .get(getProductReviews)
  .post(protect, addOrUpdateReview);

module.exports = router;
