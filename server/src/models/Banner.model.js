/**
 * Banner.model.js
 * Promotional banners managed by admins.
 */
const mongoose = require("mongoose");
const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Banner title is required"], trim: true, maxlength: [120, "Title cannot exceed 120 characters"] },
    subtitle: { type: String, trim: true, default: "" },
    imageUrl: { type: String, required: [true, "Banner image URL is required"] },
    mobileImageUrl: { type: String, default: "" },
    linkUrl: { type: String, default: "" },
    linkText: { type: String, default: "Shop Now" },
    placement: { type: String, enum: ["hero", "marquee", "sale", "category", "sidebar"], default: "hero", index: true },
    isActive: { type: Boolean, default: true, index: true },
    startsAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);
bannerSchema.index({ placement: 1, isActive: 1, sortOrder: 1 });
const Banner = mongoose.model("Banner", bannerSchema);
module.exports = Banner;
