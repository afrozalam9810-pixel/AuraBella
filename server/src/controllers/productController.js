/**
 * productController.js
 * Controller for Products.
 */

const Product = require("../models/Product.model");
const Review = require("../models/Review.model");

/**
 * @desc    Get paginated products list with filters and sorting
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      subCategory,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    // 1. Build Query
    const query = {};

    if (category) {
      query.category = category;
    }

    if (subCategory) {
      query.subCategory = subCategory;
    }

    // Price Filtering (considering both price and discountPrice)
    // Note: If a product has a discount price, we want to filter based on it,
    // otherwise fallback to the regular price. A clean query handles this
    // via $or or we can filter on the base price field for simplicity,
    // or use a more comprehensive query. Let's do range on price / discountPrice:
    if (minPrice || maxPrice) {
      query.$and = [];
      if (minPrice) {
        query.$and.push({
          $or: [
            { discountPrice: { $gte: Number(minPrice) } },
            { $and: [{ discountPrice: null }, { price: { $gte: Number(minPrice) } }] },
          ],
        });
      }
      if (maxPrice) {
        query.$and.push({
          $or: [
            { discountPrice: { $lte: Number(maxPrice) } },
            { $and: [{ discountPrice: null }, { price: { $lte: Number(maxPrice) } }] },
          ],
        });
      }
    }

    // 2. Build Sort
    let sortBy = { createdAt: -1 }; // default: newest

    if (sort) {
      switch (sort) {
        case "price_asc":
          // Sort by effective price (discountPrice if exists, else price)
          // MongoDB sorting by two fields can approximate this, or we sort by price.
          // For simplicity in standard indexing, sort by price
          sortBy = { price: 1 };
          break;
        case "price_desc":
          sortBy = { price: -1 };
          break;
        case "newest":
          sortBy = { createdAt: -1 };
          break;
        case "popular":
          sortBy = { avgRating: -1, numReviews: -1 };
          break;
        default:
          sortBy = { createdAt: -1 };
      }
    }

    // 3. Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skipNum = (pageNum - 1) * limitNum;

    // Execute query
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate("category", "name slug")
      .populate("subCategory", "name slug")
      .sort(sortBy)
      .skip(skipNum)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      pages: Math.ceil(total / limitNum),
      page: pageNum,
      limit: limitNum,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product by ID with category and reviews
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name slug")
      .populate("subCategory", "name slug");

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    // Fetch related reviews and populate the user details
    const reviews = await Review.find({ product: product._id })
      .populate("user", "name email avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        ...product.toObject(),
        reviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search products by name/description using text index
 * @route   GET /api/products/search
 * @access  Public
 */
const searchProducts = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      res.status(400);
      throw new Error("Search term is required");
    }

    // Full-text search with sorting by text relevance score
    const products = await Product.find(
      { $text: { $search: q } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .populate("category", "name slug")
      .populate("subCategory", "name slug");

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  searchProducts,
  createProduct: async (req, res, next) => {
    try {
      const product = await Product.create(req.body);
      res.status(201).json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  },
  updateProduct: async (req, res, next) => {
    try {
      const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!product) {
        res.status(404);
        throw new Error("Product not found");
      }
      res.status(200).json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  },
  deleteProduct: async (req, res, next) => {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) {
        res.status(404);
        throw new Error("Product not found");
      }
      res.status(200).json({ success: true, message: "Product deleted successfully" });
    } catch (err) {
      next(err);
    }
  },
};
