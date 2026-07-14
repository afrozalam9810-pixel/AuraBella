/**
 * pushService.js
 * Web Push Notification service using the `web-push` (VAPID) standard.
 *
 * Required .env variables:
 *   VAPID_PUBLIC_KEY   – VAPID public key (generate once with: node -e "const wp=require('web-push'); const {publicKey,privateKey}=wp.generateVAPIDKeys(); console.log(publicKey,privateKey)")
 *   VAPID_PRIVATE_KEY  – VAPID private key
 *   VAPID_EMAIL        – Contact email sent in VAPID header (e.g. mailto:admin@aurabellaafroz.com)
 *
 * PushSubscription documents are stored in the PushSubscription model.
 * The frontend service worker must call navigator.serviceWorker.ready.then(sw => sw.pushManager.subscribe(...))
 * and POST the subscription object to POST /api/push/subscribe.
 */

const webpush = require("web-push");
const logger  = require("../config/logger");

let _configured = false;

const configure = () => {
  if (_configured) return true;
  const pub   = process.env.VAPID_PUBLIC_KEY;
  const priv  = process.env.VAPID_PRIVATE_KEY;
  const email = process.env.VAPID_EMAIL || "mailto:admin@aurabellaafroz.com";
  if (!pub || !priv) {
    logger.warn("[PushService] VAPID keys not configured — push notifications disabled.");
    return false;
  }
  webpush.setVapidDetails(email, pub, priv);
  _configured = true;
  return true;
};

/**
 * Send a push notification to a single subscription object.
 * @param {object} subscription – The browser PushSubscription JSON object
 * @param {object} payload      – { title, body, icon?, badge?, url? }
 */
const sendPush = async (subscription, payload) => {
  if (!configure()) return;
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
  } catch (err) {
    if (err.statusCode === 410 || err.statusCode === 404) {
      // Subscription expired or revoked — caller should delete it
      const expiredError = new Error("SUBSCRIPTION_EXPIRED");
      expiredError.endpoint = subscription.endpoint;
      throw expiredError;
    }
    logger.error(`[PushService] Failed to send push: ${err.message}`);
    throw err;
  }
};

/**
 * Broadcast a notification to an array of subscription objects.
 * Expired subscriptions are returned so the caller can clean them up.
 * @param {Array}  subscriptions
 * @param {object} payload
 * @returns {Promise<string[]>} Array of expired endpoints
 */
const broadcast = async (subscriptions, payload) => {
  if (!configure()) return [];
  const expiredEndpoints = [];
  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await sendPush(sub, payload);
      } catch (err) {
        if (err.message === "SUBSCRIPTION_EXPIRED") {
          expiredEndpoints.push(err.endpoint);
        }
      }
    })
  );
  return expiredEndpoints;
};

/**
 * Build a flash-sale notification payload.
 */
const buildFlashSalePayload = (details) => ({
  title: `⚡ Flash Sale: ${details.title}`,
  body:  `${details.discountText} — ends ${details.expiresAt ? new Date(details.expiresAt).toLocaleString("en-IN") : "soon"}!`,
  icon:  "/icon-192.png",
  badge: "/badge-72.png",
  url:   details.ctaUrl || "/",
});

/**
 * Build an order status notification payload.
 */
const buildOrderStatusPayload = (orderId, status) => {
  const labels = {
    shipped:          `🚚 Your order #${orderId} is on its way!`,
    out_for_delivery: `📦 Out for delivery! Order #${orderId} arrives today.`,
    delivered:        `🎉 Order #${orderId} delivered! Enjoy your purchase.`,
    cancelled:        `❌ Order #${orderId} has been cancelled.`,
  };
  return {
    title: "AuraBella Order Update",
    body:  labels[status] || `Order #${orderId} updated to: ${status}`,
    icon:  "/icon-192.png",
    badge: "/badge-72.png",
    url:   `/account/orders`,
  };
};

module.exports = {
  configure,
  sendPush,
  broadcast,
  buildFlashSalePayload,
  buildOrderStatusPayload,
};
