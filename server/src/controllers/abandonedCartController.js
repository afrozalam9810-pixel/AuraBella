const Cart  = require("../models/Cart.model");
const Order = require("../models/Order.model");
const ABANDONED_AFTER_HOURS = 2;
const getAbandonedCarts = async (req, res, next) => {
  try {
    const { hours = ABANDONED_AFTER_HOURS, page = 1, limit = 20 } = req.query;
    const cutoff = new Date(Date.now() - Number(hours) * 60 * 60 * 1000);
    const carts = await Cart.find({ "items.0": { $exists: true }, updatedAt: { $lte: cutoff } })
      .populate("user", "name email phone createdAt")
      .populate("items.product", "name price discountPrice images brand")
      .sort({ updatedAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    const total = await Cart.countDocuments({ "items.0": { $exists: true }, updatedAt: { $lte: cutoff } });
    const usersWithOrders = new Set(
      (await Order.find({ orderStatus: { $nin: ["pending_payment", "cancelled"] }, createdAt: { $gte: cutoff } }).distinct("user")).map(String)
    );
    const abandoned = carts
      .filter((c) => c.user && !usersWithOrders.has(c.user._id.toString()))
      .map((c) => {
        const cartValue = c.items.reduce((sum, item) => sum + (item.product?.discountPrice ?? item.product?.price ?? 0) * item.qty, 0);
        return { cartId: c._id, user: c.user, items: c.items, cartValue, lastUpdated: c.updatedAt, idleHours: Math.round((Date.now() - new Date(c.updatedAt)) / 3600000) };
      });
    const totalCartValue = abandoned.reduce((s, c) => s + c.cartValue, 0);
    res.status(200).json({ success: true, summary: { totalAbandoned: total, totalCartValue, cutoffHours: Number(hours) }, count: abandoned.length, page: Number(page), data: abandoned });
  } catch (err) { next(err); }
};
module.exports = { getAbandonedCarts };
