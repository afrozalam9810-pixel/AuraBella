/**
 * bannerController.js
 * CRUD for promotional banners. Admin-only for writes; public for reads.
 */
const Banner = require("../models/Banner.model");
const cache  = require("../config/cache");
const CACHE_TTL = 120;

const getBanners = async (req, res, next) => {
  try {
    const { placement } = req.query;
    const cacheKey = `api:banners:${placement || "all"}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.status(200).json(cached);
    const filter = { isActive: true };
    if (placement) filter.placement = placement;
    const now = new Date();
    filter.$and = [
      { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
      { $or: [{ endsAt: null },   { endsAt:   { $gte: now } }] },
    ];
    const banners = await Banner.find(filter).sort({ sortOrder: 1, createdAt: -1 });
    const payload = { success: true, count: banners.length, data: banners };
    cache.set(cacheKey, payload, CACHE_TTL);
    res.status(200).json(payload);
  } catch (err) { next(err); }
};

const adminGetBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find({}).sort({ sortOrder: 1, createdAt: -1 });
    res.status(200).json({ success: true, count: banners.length, data: banners });
  } catch (err) { next(err); }
};

const createBanner = async (req, res, next) => {
  try {
    const banner = await Banner.create(req.body);
    cache.delByPrefix("api:banners:");
    res.status(201).json({ success: true, data: banner });
  } catch (err) { next(err); }
};

const updateBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!banner) { res.status(404); throw new Error("Banner not found"); }
    cache.delByPrefix("api:banners:");
    res.status(200).json({ success: true, data: banner });
  } catch (err) { next(err); }
};

const deleteBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) { res.status(404); throw new Error("Banner not found"); }
    cache.delByPrefix("api:banners:");
    res.status(200).json({ success: true, message: "Banner deleted" });
  } catch (err) { next(err); }
};

module.exports = { getBanners, adminGetBanners, createBanner, updateBanner, deleteBanner };
