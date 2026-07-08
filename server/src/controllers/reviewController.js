/**
 * reviewController.js
 * Controller for product reviews.
 */

const Review = require("../models/Review.model");
const Product = require("../models/Product.model");

/**
 * Recalculate average rating and number of reviews for a product.
 * Helper function called after a review is created or updated.
 *
 * @param {string} productId
 */
const updateProductRatingStats = async (productId) => {
  try {
    const reviews = await Review.find({ product: productId });
    const numReviews = reviews.length;
    const avgRating =
      numReviews > 0
        ? parseFloat(
            (reviews.reduce((sum, r) => sum + r.rating, 0) / numReviews).toFixed(1)
          )
        : 0;

    await Product.findByIdAndUpdate(productId, {
      avgRating,
      numReviews,
    });
  } catch (error) {
    console.error("Error updating product rating stats:", error.message);
  }
};

/**
 * @desc    Add or update review for a product
 * @route   POST /api/products/:id/reviews
 * @access  Private
 */
const addOrUpdateReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;
    const userId = req.user._id;

    // 1. Validate inputs
    if (!rating || !comment) {
      res.status(400);
      throw new Error("Rating and comment are required");
    }

    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      res.status(400);
      throw new Error("Rating must be a number between 1 and 5");
    }

    // 2. Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    // 3. Check if user already reviewed this product
    let review = await Review.findOne({ product: productId, user: userId });

    if (review) {
      // Update existing review
      review.rating = ratingNum;
      review.comment = comment;
      await review.save();
      console.log(`Updated review for product ${productId} by user ${userId}`);
    } else {
      // Create new review
      review = await Review.create({
        user: userId,
        product: productId,
        rating: ratingNum,
        comment,
      });
      console.log(`Created new review for product ${productId} by user ${userId}`);
    }

    // 4. Recalculate stats on Product
    await updateProductRatingStats(productId);

    res.status(200).json({
      success: true,
      message: "Review submitted successfully",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reviews for a product (paginated)
 * @route   GET /api/products/:id/reviews
 * @access  Public
 */
const getProductReviews = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const { page = 1, limit = 10 } = req.query;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skipNum = (pageNum - 1) * limitNum;

    const total = await Review.countDocuments({ product: productId });
    const reviews = await Review.find({ product: productId })
      .populate("user", "name email avatar")
      .sort({ createdAt: -1 })
      .skip(skipNum)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      pages: Math.ceil(total / limitNum),
      page: pageNum,
      limit: limitNum,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addOrUpdateReview,
  getProductReviews,
};
