/**
 * Product.model.js
 * Mongoose model for products in AuraBella.
 */

const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      trim: true,
      default: "",
    },
    color: {
      type: String,
      trim: true,
      default: "",
    },
    stock: {
      type: Number,
      required: [true, "Variant stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [200, "Product name cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product category is required"],
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    brand: {
      type: String,
      required: [true, "Brand name is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    discountPrice: {
      type: Number,
      default: null,
      validate: {
        validator: function (value) {
          // If discountPrice is provided, it must be less than price
          if (value === null || value === undefined) return true;
          return value < this.price;
        },
        message: "Discount price ({VALUE}) must be less than the regular price",
      },
    },
    images: {
      type: [String],
      required: [true, "At least one product image is required"],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "A product must have at least one image url",
      },
    },
    variants: {
      type: [variantSchema],
      default: [],
    },
    avgRating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot exceed 5"],
    },
    numReviews: {
      type: Number,
      default: 0,
      min: [0, "Number of reviews cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
productSchema.index({ category: 1 });
productSchema.index({ subCategory: 1 });
productSchema.index({ price: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ name: "text", description: "text", brand: "text" }); // Text index for search functionality

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
