/**
 * categoryController.js
 * Controller for product categories.
 */

const Category = require("../models/Category.model");

/**
 * @desc    Get all categories with nested sub-categories
 * @route   GET /api/categories
 * @access  Public
 */
const getCategories = async (req, res, next) => {
  try {
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

    res.status(200).json({
      success: true,
      count: nestedCategories.length,
      data: nestedCategories,
    });
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
      res.status(200).json({ success: true, message: "Category deleted successfully" });
    } catch (err) {
      next(err);
    }
  },
};
