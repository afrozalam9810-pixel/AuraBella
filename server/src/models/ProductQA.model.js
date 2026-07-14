/**
 * ProductQA.model.js
 * Customer Q&A board for products.
 */
const mongoose = require("mongoose");
const productQASchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    askedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    question: { type: String, required: [true, "Question is required"], trim: true, minlength: [10, "Question must be at least 10 characters"], maxlength: [500, "Question cannot exceed 500 characters"] },
    answer: { type: String, trim: true, default: "", maxlength: [1000, "Answer cannot exceed 1000 characters"] },
    answeredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    answeredAt: { type: Date, default: null },
    isApproved: { type: Boolean, default: false },
    helpful: { type: Number, default: 0 },
  },
  { timestamps: true }
);
productQASchema.index({ product: 1, isApproved: 1, createdAt: -1 });
const ProductQA = mongoose.model("ProductQA", productQASchema);
module.exports = ProductQA;
