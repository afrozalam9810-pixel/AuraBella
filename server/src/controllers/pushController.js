/**
 * pushController.js
 * Manages Web Push subscription registration and admin broadcast triggers.
 */
const PushSubscription = require("../models/PushSubscription.model");
const { broadcast, buildFlashSalePayload } = require("../services/pushService");
const logger = require("../config/logger");

/**
 * POST /api/push/subscribe
 * Register or update a browser push subscription. Auth optional (anonymous is OK).
 */
const subscribe = async (req, res, next) => {
  try {
    const { endpoint, keys, userAgent } = req.body;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      res.status(400);
      throw new Error("endpoint and keys (p256dh, auth) are required");
    }

    const userId = req.user?._id || null;

    await PushSubscription.findOneAndUpdate(
      { endpoint },
      { endpoint, keys, user: userId, userAgent: userAgent || "" },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ success: true, message: "Push subscription registered." });
  } catch (err) { next(err); }
};

/**
 * DELETE /api/push/unsubscribe
 * Remove a push subscription by endpoint.
 */
const unsubscribe = async (req, res, next) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) { res.status(400); throw new Error("endpoint is required"); }
    await PushSubscription.findOneAndDelete({ endpoint });
    res.status(200).json({ success: true, message: "Push subscription removed." });
  } catch (err) { next(err); }
};

/**
 * POST /api/admin/push/broadcast
 * Admin broadcasts a flash-sale push to all subscribers.
 */
const broadcastFlashSale = async (req, res, next) => {
  try {
    const { title, discountText, expiresAt, ctaUrl } = req.body;
    if (!title || !discountText) { res.status(400); throw new Error("title and discountText are required"); }

    const subs = await PushSubscription.find({}).lean();
    if (subs.length === 0) {
      return res.status(200).json({ success: true, message: "No subscribers to push to.", sent: 0 });
    }

    const subscriptionObjects = subs.map((s) => ({ endpoint: s.endpoint, keys: s.keys }));
    const payload = buildFlashSalePayload({ title, discountText, expiresAt, ctaUrl });

    const expiredEndpoints = await broadcast(subscriptionObjects, payload);

    // Prune expired subscriptions in the background
    if (expiredEndpoints.length > 0) {
      PushSubscription.deleteMany({ endpoint: { $in: expiredEndpoints } }).catch((e) =>
        logger.error(`[Push] Failed to prune expired endpoints: ${e.message}`)
      );
    }

    res.status(200).json({
      success: true,
      sent: subs.length - expiredEndpoints.length,
      pruned: expiredEndpoints.length,
    });
  } catch (err) { next(err); }
};

module.exports = { subscribe, unsubscribe, broadcastFlashSale };
