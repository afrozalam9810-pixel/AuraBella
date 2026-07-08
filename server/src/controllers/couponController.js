const Coupon = require("../models/Coupon.model");

module.exports = {
  getCoupons: async (req, res, next) => {
    try {
      const coupons = await Coupon.find({}).sort({ createdAt: -1 });
      res.status(200).json({ success: true, count: coupons.length, data: coupons });
    } catch (err) {
      next(err);
    }
  },
  createCoupon: async (req, res, next) => {
    try {
      const { code, discountType, discountValue, expiryDate, minOrderValue } = req.body;
      const coupon = await Coupon.create({
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        expiryDate: new Date(expiryDate),
        minOrderValue: Number(minOrderValue || 0),
        isActive: true,
      });
      res.status(201).json({ success: true, data: coupon });
    } catch (err) {
      next(err);
    }
  },
  deleteCoupon: async (req, res, next) => {
    try {
      const coupon = await Coupon.findByIdAndDelete(req.params.id);
      if (!coupon) {
        res.status(404);
        throw new Error("Coupon not found");
      }
      res.status(200).json({ success: true, message: "Coupon deleted successfully" });
    } catch (err) {
      next(err);
    }
  },
};
