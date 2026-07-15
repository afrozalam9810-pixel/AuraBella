/**
 * Product.model.js
 * Mongoose model for products in AuraBella.
 */

const mongoose = require("mongoose");
const { randomUUID } = require("crypto");

const createProductId = () => `AB-${randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase()}`;

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
    productId: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
      immutable: true,
      default: createProductId,
      uppercase: true,
      trim: true,
      match: [/^AB-[A-F0-9]{12}$/, "Product ID has an invalid format"],
    },
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
          // During findByIdAndUpdate, Mongoose binds `this` to the query
          // rather than the document. Read the submitted price from that
          // query so catalog edits validate correctly as well as creates.
          const price = typeof this.get === "function" ? this.get("price") : this.price;
          return price === undefined || price === null || value < price;
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
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    supplierEmail: {
      type: String,
      default: "",
      trim: true,
    },
    supplierPhone: {
      type: String,
      default: "",
      trim: true,
    },
    reorderThreshold: {
      type: Number,
      default: 5,
      min: 0,
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
productSchema.index({ isDeleted: 1 });
productSchema.index({ createdAt: -1 }); // Index default sort field to prevent in-memory sort timeouts
productSchema.index({ name: "text", description: "text", brand: "text" }); // Text index for search functionality
// A product is identified by its name and description.  The collation makes
// the constraint case-insensitive, so "Silk Dress" and "silk dress" cannot
// be entered as separate products with the same description.
productSchema.index(
  { name: 1, description: 1 },
  {
    unique: true,
    name: "unique_product_name_description",
    collation: { locale: "en", strength: 2 },
  }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
