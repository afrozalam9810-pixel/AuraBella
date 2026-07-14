/**
 * categoryController.js
 * Controller for product categories.
 *
 * Cache strategy:
 *  - GET /api/categories  → cached for 5 minutes (categories change rarely)
 *  - Any write mutation   → busts the cache key immediately
 */

const Category = require("../models/Category.model");
const cache    = require("../config/cache");

const CACHE_KEY = "api:categories";
const CACHE_TTL = 300; // 5 minutes

/**
 * @desc    Get all categories with nested sub-categories
 * @route   GET /api/categories
 * @access  Public
 */
const getCategories = async (req, res, next) => {
  try {
    // ── Cache read ───────────────────────────────────────────────────────────
    const cached = cache.get(CACHE_KEY);
    if (cached) {
      return res.status(200).json(cached);
    }

    // ── DB query ─────────────────────────────────────────────────────────────
    const categories = await Category.find({});

    // Filter parent categories (parentCategory is null)
    const parents = categories.filter((cat) => cat.parentCategory === null);

    // Map each parent to include its sub-categories
    const nestedCategories = parents.map((parent) => {
      const subCategories = categories.filter(
        (cat) =>
          cat.parentCategory &&
          cat.parentCategory.toString() === parent._id.toString()
      );

      return {
        _id: parent._id,
        name: parent.name,
        slug: parent.slug,
        createdAt: parent.createdAt,
        updatedAt: parent.updatedAt,
        subCategories: subCategories.map((sub) => ({
          _id: sub._id,
          name: sub.name,
          slug: sub.slug,
          createdAt: sub.createdAt,
          updatedAt: sub.updatedAt,
        })),
      };
    });

    const payload = {
      success: true,
      count: nestedCategories.length,
      data: nestedCategories,
    };

    // ── Cache write ──────────────────────────────────────────────────────────
    cache.set(CACHE_KEY, payload, CACHE_TTL);

    res.status(200).json(payload);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory: async (req, res, next) => {
    try {
      const { name, parentCategory } = req.body;
      const slug = name.toLowerCase().replace(/\s+/g, "-");
      const category = await Category.create({
        name,
        slug,
        parentCategory: parentCategory || null,
      });
      cache.del(CACHE_KEY); // bust cache on write
      res.status(201).json({ success: true, data: category });
    } catch (err) {
      next(err);
    }
  },
  updateCategory: async (req, res, next) => {
    try {
      const { name, parentCategory } = req.body;
      const updates = {};
      if (name) {
        updates.name = name;
        updates.slug = name.toLowerCase().replace(/\s+/g, "-");
      }
      if (parentCategory !== undefined) {
        updates.parentCategory = parentCategory || null;
      }

      const category = await Category.findByIdAndUpdate(req.params.id, updates, { new: true });
      if (!category) {
        res.status(404);
        throw new Error("Category not found");
      }
      cache.del(CACHE_KEY); // bust cache on write
      res.status(200).json({ success: true, data: category });
    } catch (err) {
      next(err);
    }
  },
  deleteCategory: async (req, res, next) => {
    try {
      const category = await Category.findByIdAndDelete(req.params.id);
      if (!category) {
        res.status(404);
        throw new Error("Category not found");
      }
      cache.del(CACHE_KEY); // bust cache on write
      res.status(200).json({ success: true, message: "Category deleted successfully" });
    } catch (err) {
      next(err);
    }
  },
};
