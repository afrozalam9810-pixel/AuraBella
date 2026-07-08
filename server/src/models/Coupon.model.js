/**
 * Coupon.model.js
 * Mongoose model for promotional discount coupons.
 */

const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
      minlength: [3, "Coupon code must be at least 3 characters"],
      maxlength: [20, "Coupon code cannot exceed 20 characters"],
    },
    discountType: {
      type: String,
      required: [true, "Discount type is required"],
      enum: {
        values: ["percentage", "flat"],
        message: "Discount type must be either 'percentage' or 'flat'",
      },
    },
    discountValue: {
      type: Number,
      required: [true, "Discount value is required"],
      min: [0, "Discount value cannot be negative"],
      validate: {
        validator: function (v) {
          // If percentage discount, value must not exceed 100
          if (this.discountType === "percentage") {
            return v <= 100;
          }
          return true;
        },
        message: "Percentage discount value cannot exceed 100%",
      },
    },
    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"],
      validate: {
        validator: function (v) {
          return v > new Date();
        },
        message: "Expiry date must be in the future",
      },
    },
    minOrderValue: {
      type: Number,
      default: 0,
      min: [0, "Minimum order value cannot be negative"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual to check if coupon is expired
couponSchema.virtual("isExpired").get(function () {
  return new Date() > this.expiryDate;
});

// Configure schemas to include virtuals when logging or converting to JSON
couponSchema.set("toJSON", { virtuals: true });
couponSchema.set("toObject", { virtuals: true });

const Coupon = mongoose.model("Coupon", couponSchema);
module.exports = Coupon;
