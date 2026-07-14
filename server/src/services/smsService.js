/**
 * smsService.js
 * Thin SMS dispatch layer.
 *
 * Supports Twilio (primary) with a console-sandbox fallback when credentials
 * are absent (local development).
 *
 * Required .env variables:
 *   TWILIO_ACCOUNT_SID   – Twilio account SID
 *   TWILIO_AUTH_TOKEN    – Twilio auth token
 *   TWILIO_PHONE_NUMBER  – Twilio sender number (E.164 format, e.g. +919999999999)
 *
 * All public methods are fire-and-forget and will NEVER throw to the caller.
 */

const logger = require("../config/logger");

// Lazily initialise the Twilio client so the server still boots without creds.
let _client = null;
const getClient = () => {
  if (_client) return _client;
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  _client = require("twilio")(sid, token);
  return _client;
};

const FROM = process.env.TWILIO_PHONE_NUMBER || "";

/**
 * Core dispatcher. Resolves (never rejects) so callers don't need try/catch.
 */
const sendSMS = async (to, body) => {
  if (!to) return;
  const client = getClient();
  if (!client || !FROM) {
    logger.info(`[SMS SANDBOX] TO: ${to} | MSG: ${body}`);
    return;
  }
  try {
    const msg = await client.messages.create({ from: FROM, to, body });
    logger.info(`[SMS] Sent to ${to} — SID: ${msg.sid}`);
  } catch (err) {
    logger.error(`[SMS] Failed to send to ${to}: ${err.message}`);
  }
};

// ── Public Helpers ───────────────────────────────────────────────────────────

/**
 * Send an order shipped SMS with courier + tracking details.
 */
const sendOrderShippedSMS = (phone, orderDetails) => {
  const { orderId, courierPartner, trackingNumber, estimatedDelivery } = orderDetails;
  const body =
    `Your AuraBella order #${orderId} has been shipped via ${courierPartner || "our partner"}. ` +
    `Tracking: ${trackingNumber || "N/A"}.` +
    (estimatedDelivery ? ` Expected delivery: ${new Date(estimatedDelivery).toDateString()}.` : "") +
    ` Track at: https://aurabellaafroz.com/account/orders`;
  return sendSMS(phone, body);
};

/**
 * Send an order delivered SMS confirmation.
 */
const sendOrderDeliveredSMS = (phone, orderId) => {
  const body =
    `Your AuraBella order #${orderId} has been delivered! 🎉 ` +
    `If you have any concerns, contact us at support@aurabellaafroz.com`;
  return sendSMS(phone, body);
};

/**
 * Send an OTP SMS.
 */
const sendOtpSMS = (phone, otp) => {
  const body = `Your AuraBella verification code is: ${otp}. Valid for 10 minutes. Do not share this with anyone.`;
  return sendSMS(phone, body);
};

/**
 * Send a flash sale alert SMS.
 */
const sendFlashSaleSMS = (phone, details) => {
  const { title, discountText, expiresAt, ctaUrl } = details;
  const body =
    `⚡ AuraBella Flash Sale: ${title}! ${discountText}. ` +
    `Ends: ${expiresAt ? new Date(expiresAt).toLocaleString("en-IN") : "soon"}. ` +
    `Shop: ${ctaUrl || "https://aurabellaafroz.com"}`;
  return sendSMS(phone, body);
};

/**
 * Send a low-stock alert SMS to a supplier.
 */
const sendLowStockSMS = (phone, details) => {
  const { productName, sku, currentStock, threshold } = details;
  const body =
    `[AuraBella Supplier Alert] Low stock for "${productName}"` +
    (sku ? ` (SKU: ${sku})` : "") +
    `. Current stock: ${currentStock}, threshold: ${threshold}. Please replenish.`;
  return sendSMS(phone, body);
};

module.exports = {
  sendSMS,
  sendOrderShippedSMS,
  sendOrderDeliveredSMS,
  sendOtpSMS,
  sendFlashSaleSMS,
  sendLowStockSMS,
};
