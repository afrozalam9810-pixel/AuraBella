/**
 * emailService.js
 * Central email sending module. Configures SMTP connection pool,
 * houses helper dispatch methods, and maintains the queue processor.
 */

const nodemailer = require("nodemailer");
const EmailLog = require("../../models/EmailLog.model");

// Import template functions
const templates = {
  welcomeEmail: require("./emailTemplates/welcomeEmail"),
  loginAlert: require("./emailTemplates/loginAlert"),
  orderPlaced: require("./emailTemplates/orderPlaced"),
  paymentSuccess: require("./emailTemplates/paymentSuccess"),
  paymentFailed: require("./emailTemplates/paymentFailed"),
  orderStatusUpdate: require("./emailTemplates/orderStatusUpdate"),
  returnStatusUpdate: require("./emailTemplates/returnStatusUpdate"),
  refundStatusUpdate: require("./emailTemplates/refundStatusUpdate"),
  passwordReset: require("./emailTemplates/passwordReset"),
  passwordChanged: require("./emailTemplates/passwordChanged"),
  emailVerification: require("./emailTemplates/emailVerification"),
  profileUpdated: require("./emailTemplates/profileUpdated"),
  newsletter: require("./emailTemplates/newsletter"),
  contactReply: require("./emailTemplates/contactReply"),
  adminNotification: require("./emailTemplates/adminNotification"),
  invoiceEmail: require("./emailTemplates/invoiceEmail"),
  shippingLabelEmail: require("./emailTemplates/shippingLabelEmail"),
  accountDeleted: require("./emailTemplates/accountDeleted"),
  couponReceived: require("./emailTemplates/couponReceived"),
  abandonedCart: require("./emailTemplates/abandonedCart"),
  supplierLowStockAlert: require("./emailTemplates/supplierLowStockAlert"),
  feedbackRequest: require("./emailTemplates/feedbackRequest"),
};

// Create transporter
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn("[EmailService] SMTP credentials are not configured in .env. Emails will log but print to console.");
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // True for 465, false for 587
    auth: {
      user,
      pass,
    },
    pool: true, // Use connection pooling
    maxConnections: 5,
    maxMessages: 100,
  });

  return transporter;
};

/**
 * Enqueue an email into the database log and run the background queue processor.
 */
const enqueueEmail = async (recipient, subject, templateName, context = {}) => {
  try {
    if (!templates[templateName]) {
      throw new Error(`Email template "${templateName}" does not exist`);
    }

    const log = await EmailLog.create({
      recipient,
      subject,
      template: templateName,
      context,
      status: "pending",
    });

    // Run queue in the background (asynchronous, non-blocking)
    setImmediate(() => {
      processEmailQueue().catch((err) =>
        console.error("[EmailQueue] Error during background execution:", err.message)
      );
    });

    return log;
  } catch (err) {
    console.error("[EmailService] Failed to enqueue email:", err.message);
    return null;
  }
};

/**
 * Process pending/failed emails in the queue.
 */
const processEmailQueue = async () => {
  const activeTransporter = getTransporter();
  const from = process.env.EMAIL_FROM || "Aurabella <contact@aurabellaafroz.com>";

  // Find up to 10 pending/failed logs
  const pendingLogs = await EmailLog.find({
    status: { $in: ["pending", "failed"] },
    retries: { $lt: 3 },
  }).limit(10);

  if (pendingLogs.length === 0) return;

  console.log(`[EmailQueue] Processing ${pendingLogs.length} pending email(s)...`);

  for (const log of pendingLogs) {
    try {
      const templateFn = templates[log.template];
      const htmlContent = templateFn(log.context);

      if (activeTransporter) {
        // Send email via SMTP
        await activeTransporter.sendMail({
          from,
          to: log.recipient,
          subject: log.subject,
          html: htmlContent,
        });
      } else {
        // Log to console if credentials are empty (local development sandboxing)
        console.log(`\n==================================================`);
        console.log(`[SANDBOX EMAIL] TO: ${log.recipient}`);
        console.log(`[SANDBOX EMAIL] SUBJECT: ${log.subject}`);
        console.log(`[SANDBOX EMAIL] TEMPLATE: ${log.template}`);
        console.log(`==================================================\n`);
      }

      log.status = "sent";
      log.sentAt = new Date();
      log.error = "";
      await log.save();
    } catch (err) {
      console.error(`[EmailQueue] Failed to send email ID ${log._id}:`, err.message);
      log.retries += 1;
      log.status = "failed";
      log.failedAt = new Date();
      log.error = err.message || "Unknown SMTP connection error";
      await log.save();
    }
  }
};

/**
 * Public Dispatcher Functions
 */
const sendWelcomeEmail = (email, name) => {
  return enqueueEmail(email, "Welcome to Aurabella ❤️", "welcomeEmail", { name });
};

const sendVerificationEmail = (email, name, otp) => {
  return enqueueEmail(email, "Verify Your Aurabella Account Email", "emailVerification", { name, otp });
};

const sendLoginAlert = (email, name, details) => {
  return enqueueEmail(email, "Security Alert: New Login Detected | Aurabella", "loginAlert", {
    name,
    ...details,
  });
};

const sendPasswordReset = (email, name, resetLink) => {
  return enqueueEmail(email, "Reset Your Aurabella Password", "passwordReset", { name, resetLink });
};

const sendPasswordChanged = (email, name, details) => {
  return enqueueEmail(email, "Security Notification: Password Changed | Aurabella", "passwordChanged", {
    name,
    ...details,
  });
};

const sendProfileUpdated = (email, name, changes) => {
  return enqueueEmail(email, "Security Notification: Profile Updated | Aurabella", "profileUpdated", {
    name,
    changes,
  });
};

const sendOrderPlaced = (order) => {
  const recipient = order.shippingAddress?.email || order.user?.email;
  if (!recipient) return null;
  return enqueueEmail(recipient, `Order Placed Successfully #${order.orderId}`, "orderPlaced", { order });
};

const sendOrderStatus = (order, status, extra = {}) => {
  const recipient = order.shippingAddress?.email || order.user?.email;
  if (!recipient) return null;
  
  let subject = `Order Update: #${order.orderId}`;
  if (status === "shipped") subject = `Order Shipped! #${order.orderId} 🚚`;
  if (status === "delivered") subject = `Order Delivered successfully! #${order.orderId} 🎉`;
  if (status === "cancelled") subject = `Order Cancelled: #${order.orderId}`;
  
  return enqueueEmail(recipient, subject, "orderStatusUpdate", { order, status, ...extra });
};

const sendReturnStatus = (order, status, extra = {}) => {
  const recipient = order.shippingAddress?.email || order.user?.email;
  if (!recipient) return null;
  
  let subject = `Return Update: #${order.orderId}`;
  if (status === "received") subject = `Return Request Received: #${order.orderId}`;
  if (status === "approved") subject = `Return Request Approved! #${order.orderId}`;
  
  return enqueueEmail(recipient, subject, "returnStatusUpdate", { order, status, ...extra });
};

const sendRefundStatus = (order, status, amount) => {
  const recipient = order.shippingAddress?.email || order.user?.email;
  if (!recipient) return null;
  
  let subject = `Refund Update: #${order.orderId}`;
  if (status === "initiated") subject = `Refund Initiated: #${order.orderId}`;
  if (status === "completed") subject = `Refund Settled successfully! #${order.orderId}`;
  
  return enqueueEmail(recipient, subject, "refundStatusUpdate", { order, status, amount });
};

const sendPaymentSuccess = (order, paymentId, amount) => {
  const recipient = order.shippingAddress?.email || order.user?.email;
  if (!recipient) return null;
  return enqueueEmail(recipient, `Payment Received for Order #${order.orderId}`, "paymentSuccess", {
    order,
    paymentId,
    amount,
  });
};

const sendPaymentFailed = (order, amount, error) => {
  const recipient = order.shippingAddress?.email || order.user?.email;
  if (!recipient) return null;
  return enqueueEmail(recipient, `Payment Failed for Order #${order.orderId}`, "paymentFailed", {
    order,
    amount,
    error,
  });
};

const sendCouponReceived = (email, name, details) => {
  return enqueueEmail(email, `Exclusive Promo Coupon inside! 🎁 | Aurabella`, "couponReceived", {
    name,
    ...details,
  });
};

const sendAbandonedCart = (email, name, cartItems) => {
  return enqueueEmail(email, "Did you forget something? 🛍️ | Aurabella", "abandonedCart", { name, cartItems });
};

const sendAutoReplyContact = (email, name, details) => {
  return enqueueEmail(email, "We Received Your Support Message | Aurabella", "contactReply", {
    isAdmin: false,
    name,
    email,
    ...details,
  });
};

const sendInvoiceEmail = (order) => {
  const recipient = order.shippingAddress?.email || order.user?.email;
  if (!recipient) return null;
  return enqueueEmail(recipient, `Tax Invoice for Order #${order.orderId}`, "invoiceEmail", { order });
};

const sendAccountDeleted = (email, name) => {
  return enqueueEmail(email, "Your Aurabella Account Has Been Closed", "accountDeleted", { name });
};

const sendNewsletterSubscription = (email) => {
  return enqueueEmail(email, "Newsletter Subscription Confirmed | Aurabella", "newsletter", {
    title: "Newsletter Subscription",
    headline: "Welcome to the Aurabella Newsletter!",
    body: "You have successfully subscribed to the Aurabella weekly newsletter. We will send you updates on new arrivals, VIP festival sales, and style guides.",
  });
};

const sendCampaignEmail = (email, title, headline, body, ctaText, ctaUrl, unsubscribeUrl) => {
  return enqueueEmail(email, title, "newsletter", {
    title,
    headline,
    body,
    ctaText,
    ctaUrl,
    unsubscribeUrl,
  });
};

// Admin Dispatchers
const notifyAdminContactForm = (details) => {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@aurabella.com";
  return enqueueEmail(adminEmail, `Admin Alert: New Contact Message`, "contactReply", {
    isAdmin: true,
    ...details,
  });
};

const notifyAdminLowStock = (details) => {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@aurabella.com";
  return enqueueEmail(adminEmail, `Admin Alert: Low Stock for ${details.productName}`, "adminNotification", {
    type: "low_stock",
    details,
  });
};

const notifyAdminNewOrder = (details) => {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@aurabella.com";
  return enqueueEmail(adminEmail, `Admin Alert: New Order Placed #${details.orderId}`, "adminNotification", {
    type: "new_order",
    details,
  });
};

const notifyAdminNewUser = (details) => {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@aurabella.com";
  return enqueueEmail(adminEmail, `Admin Alert: New User Registered`, "adminNotification", {
    type: "new_user",
    details,
  });
};

const sendShippingLabelEmail = (order, details) => {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@aurabella.com";
  return enqueueEmail(adminEmail, `Admin Alert: Shipping Label generated #${order.orderId}`, "shippingLabelEmail", {
    order,
    ...details,
  });
};

const sendSupplierLowStock = (supplierEmail, details) => {
  return enqueueEmail(supplierEmail, `[REORDER ALERT] Low stock for ${details.productName}`, "supplierLowStockAlert", details);
};

const sendFeedbackRequest = (customerEmail, name, order) => {
  return enqueueEmail(customerEmail, `We'd love your feedback on order #${order.orderId} 💖`, "feedbackRequest", { name, order });
};

module.exports = {
  enqueueEmail,
  processEmailQueue,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendLoginAlert,
  sendPasswordReset,
  sendPasswordChanged,
  sendProfileUpdated,
  sendOrderPlaced,
  sendOrderStatus,
  sendReturnStatus,
  sendRefundStatus,
  sendPaymentSuccess,
  sendPaymentFailed,
  sendCouponReceived,
  sendAbandonedCart,
  sendAutoReplyContact,
  sendInvoiceEmail,
  sendAccountDeleted,
  sendNewsletterSubscription,
  sendCampaignEmail,
  notifyAdminContactForm,
  notifyAdminLowStock,
  notifyAdminNewOrder,
  notifyAdminNewUser,
  sendShippingLabelEmail,
  sendSupplierLowStock,
  sendFeedbackRequest,
};
