/**
 * orderController.js
 * Controller for managing customer orders and coupon validation.
 */

const mongoose = require("mongoose");
const Order = require("../models/Order.model");
const Cart = require("../models/Cart.model");
const Product = require("../models/Product.model");
const Coupon = require("../models/Coupon.model");
const InvoiceCounter = require("../models/InvoiceCounter.model");

const orderPopulate = [
  { path: "user", select: "name email phone" },
  { path: "items.product", select: "name brand images price discountPrice productId hsnCode gstRate" },
];

const ensureInvoice = async (order) => {
  if (order.invoiceNumber) return order;
  const year = new Date(order.createdAt || Date.now()).getFullYear();
  const counter = await InvoiceCounter.findOneAndUpdate(
    { year }, { $inc: { sequence: 1 } }, { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  const invoiceNumber = `ABL-${year}-${String(counter.sequence).padStart(6, "0")}`;
  const claimed = await Order.findOneAndUpdate(
    { _id: order._id, invoiceNumber: { $in: [null, ""] } },
    { $set: { invoiceNumber, invoiceDate: new Date(), invoiceStatus: "issued" } },
    { new: true }
  );
  return claimed || Order.findById(order._id);
};

const checkInventoryLevels = async (items) => {
  try {
    const { notifyAdminLowStock, sendSupplierLowStock } = require("../services/email/emailService");
    const { sendLowStockSMS } = require("../services/smsService");

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) continue;

      const variant = product.variants.find(
        (v) =>
          v.size === (item.variant?.size || "") &&
          v.color === (item.variant?.color || "")
      );

      if (!variant) continue;

      const threshold = product.reorderThreshold ?? 5;
      if (variant.stock <= threshold) {
        const details = {
          productName: product.name,
          productId: product.productId || product._id.toString(),
          sku: variant._id.toString(),
          size: variant.size,
          color: variant.color,
          stock: variant.stock,
          currentStock: variant.stock,
          threshold,
          supplierName: "AuraBella Supplier",
        };

        // 1. Notify Admin (Email)
        await notifyAdminLowStock(details);

        // 2. Notify Supplier (Email)
        if (product.supplierEmail) {
          await sendSupplierLowStock(product.supplierEmail, details);
        }

        // 3. Notify Supplier (SMS)
        if (product.supplierPhone) {
          await sendLowStockSMS(product.supplierPhone, details);
        }
      }
    }
  } catch (err) {
    console.error("[InventoryAlert] Error checking stock levels:", err.message);
  }
};

/**
 * Helper to validate a coupon code and calculate its discount amount.
 *
 * @param {string} code - The coupon code to validate
 * @param {number} cartTotal - The subtotal of the cart
 * @returns {Promise<{coupon: object, discountAmount: number}>}
 */
const validateCouponHelper = async (code, cartTotal) => {
  if (!code) {
    return { coupon: null, discountAmount: 0 };
  }

  const coupon = await Coupon.findOne({
    code: code.trim().toUpperCase(),
    isActive: true,
  });

  if (!coupon) {
    throw new Error("Coupon code is invalid or inactive");
  }

  // Check expiry
  if (new Date() > coupon.expiryDate) {
    throw new Error("Coupon code has expired");
  }

  // Check minimum order value
  if (cartTotal < coupon.minOrderValue) {
    throw new Error(
      `Coupon requires a minimum order value of ₹${coupon.minOrderValue}`
    );
  }

  let discountAmount = 0;
  if (coupon.discountType === "percentage") {
    discountAmount = parseFloat(((cartTotal * coupon.discountValue) / 100).toFixed(2));
  } else if (coupon.discountType === "flat") {
    discountAmount = coupon.discountValue;
  }

  // Clamp discount amount to not exceed the cart total
  if (discountAmount > cartTotal) {
    discountAmount = cartTotal;
  }

  return { coupon, discountAmount };
};

/**
 * @desc    Validate coupon code and return discount amount
 * @route   POST /api/orders/validate-coupon
 * @access  Private
 */
const validateCoupon = async (req, res, next) => {
  try {
    const { code, cartTotal } = req.body;

    if (!code || cartTotal === undefined) {
      res.status(400);
      throw new Error("Coupon code and cartTotal are required");
    }

    const { coupon, discountAmount } = await validateCouponHelper(code, Number(cartTotal));

    res.status(200).json({
      success: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      finalAmount: Number(cartTotal) - discountAmount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new order from cart contents
 * @route   POST /api/orders
 * @access  Private
 */
const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod, couponCode } = req.body;
    const userId = req.user._id;

    // 1. Validation
    if (!shippingAddress || !paymentMethod) {
      res.status(400);
      throw new Error("Shipping address and payment method are required");
    }

    // 2. Fetch User's Cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.items.length === 0) {
      res.status(400);
      throw new Error("Your cart is empty. Cannot place order.");
    }

    // 3. Process Cart Items, Validate Stock, and Calculate Subtotal
    let subtotal = 0;
    const orderItems = [];
    const stockUpdates = []; // To defer database updates until verification passes

    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (!product) {
        res.status(404);
        throw new Error(`Product not found for item: ${item.product}`);
      }

      // Check variant stock if variants exist on the product
      let matchedVariant = null;
      if (product.variants && product.variants.length > 0) {
        matchedVariant = product.variants.find(
          (v) =>
            v.size === (item.variant.size || "") &&
            v.color === (item.variant.color || "")
        );

        if (!matchedVariant) {
          res.status(400);
          throw new Error(
            `Variant (Size: ${item.variant.size || "none"}, Color: ${item.variant.color || "none"}) not found for product: ${product.name}`
          );
        }

        if (matchedVariant.stock < item.qty) {
          res.status(400);
          throw new Error(
            `Insufficient stock for product: ${product.name}. Available: ${matchedVariant.stock}, Requested: ${item.qty}`
          );
        }

        // Add to stock update batch queue
        stockUpdates.push({
          productId: product._id,
          variantId: matchedVariant._id,
          qty: item.qty,
        });
      } else {
        // Fallback for simple products without variants (unlikely in AuraBella, but safe)
        // Note: For simplicity, we assume simple products have stock handled or default
      }

      const priceAtPurchase =
        product.discountPrice !== null ? product.discountPrice : product.price;

      subtotal += priceAtPurchase * item.qty;

      orderItems.push({
        product: product._id,
        variant: {
          size: item.variant.size,
          color: item.variant.color,
        },
        qty: item.qty,
        priceAtPurchase,
      });
    }

    // 4. Validate Coupon and Calculate Discount
    let discountAmount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      try {
        const { coupon, discountAmount: disc } = await validateCouponHelper(
          couponCode,
          subtotal
        );
        discountAmount = disc;
        appliedCoupon = coupon;
      } catch (err) {
        res.status(400);
        throw new Error(`Coupon validation failed: ${err.message}`);
      }
    }

    const totalAmount = subtotal - discountAmount;

    // 5. Setup Database Transaction Session (with standalone fallback)
    let session = null;
    try {
      session = await mongoose.startSession();
      session.startTransaction();
    } catch (sessionErr) {
      console.warn("[Database] Transactions not supported on this MongoDB deployment. Falling back to standard pipeline.");
      session = null;
    }

    try {
      const dbOptions = session ? { session } : {};

      // Create the Order document
      const [order] = await Order.create([{
        user: userId,
        items: orderItems,
        shippingAddress,
        paymentMethod,
        paymentStatus: paymentMethod === "cod" ? "pending" : "completed",
        orderStatus: "placed",
        totalAmount,
      }], dbOptions);

      // Update Product Stock (Decrement)
      for (const update of stockUpdates) {
        const updateResult = await Product.updateOne(
          { _id: update.productId, "variants._id": update.variantId },
          { $inc: { "variants.$.stock": -update.qty } },
          dbOptions
        );
        if (updateResult.modifiedCount !== 1) {
          throw new Error(`Fulfillment stock adjustment failed for variant of ${update.productId}.`);
        }
      }

      // Clear the User's Cart
      cart.items = [];
      if (session) {
        await cart.save({ session });
        await session.commitTransaction();
        session.endSession();
      } else {
        await cart.save();
      }

      // Trigger order placement emails outside database session thread
      try {
        const populatedOrder = await Order.findById(order._id)
          .populate("user", "name email phone")
          .populate("items.product", "name brand images price discountPrice productId");

        const { sendOrderPlaced, notifyAdminNewOrder } = require("../services/email/emailService");
        await sendOrderPlaced(populatedOrder);
        await notifyAdminNewOrder({
          orderId: populatedOrder.orderId,
          customerName: req.user.name,
          amount: populatedOrder.totalAmount,
          paymentMethod: populatedOrder.paymentMethod,
        });

        // Asynchronously check stock thresholds
        checkInventoryLevels(orderItems);
      } catch (err) {
        console.error("Order placed emails/alerts failed:", err.message);
      }

      res.status(201).json({
        success: true,
        message: "Order placed successfully 🌱",
        data: order,
        billing: {
          subtotal,
          discountAmount,
          couponCode: appliedCoupon ? appliedCoupon.code : null,
          totalAmount,
        },
      });
    } catch (transactionErr) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      throw transactionErr;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged-in user's own orders
 * @route   GET /api/orders
 * @access  Private
 */
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product", "name brand images price")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single order details
 * @route   GET /api/orders/:id
 * @access  Private (Owner or Admin)
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "items.product",
      "name brand images price"
    );

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    // Authorization check: User must own the order OR be an admin
    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      res.status(403);
      throw new Error("Access denied. You do not own this order.");
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// ─── ADMIN CONTROLLERS ────────────────────────────────────────────────────────

/**
 * @desc    Get all orders (paginated, filterable by status)
 * @route   GET /api/admin/orders
 * @access  Private (Admin Only)
 */
const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) {
      query.orderStatus = status;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skipNum = (pageNum - 1) * limitNum;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate(orderPopulate)
      .sort({ createdAt: -1 })
      .skip(skipNum)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      pages: Math.ceil(total / limitNum),
      page: pageNum,
      limit: limitNum,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

const getAdminOrderById = async (req, res, next) => {
  try {
    let order = await Order.findById(req.params.id).populate(orderPopulate);
    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    // Invoice assignment writes to the order document. Some legacy orders can
    // fail an Atlas collection validator when that write occurs, even though
    // they are still valid enough to view and print. Never let invoice-number
    // generation make the order-detail page unavailable.
    try {
      order = await ensureInvoice(order);
      await order.populate(orderPopulate);
    } catch (invoiceError) {
      if (invoiceError?.code !== 121) throw invoiceError;
      console.warn(
        `[Orders] Could not assign an invoice number to legacy order ${order._id}: ${invoiceError.message}`
      );
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update orderStatus
 * @route   PUT /api/admin/orders/:id/status
 * @access  Private (Admin Only)
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;

    if (!orderStatus) {
      res.status(400);
      throw new Error("orderStatus is required");
    }

    const validStatuses = ["placed", "packed", "shipped", "out_for_delivery", "delivered", "cancelled", "refunded"];
    if (!validStatuses.includes(orderStatus)) {
      res.status(400);
      throw new Error(
        `Invalid order status. Must be one of: ${validStatuses.join(", ")}`
      );
    }

    let order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    order.orderStatus = orderStatus;
    order.statusTimeline.push({ status: orderStatus, at: new Date(), note: req.body.note || "" });
    
    // Automatically update paymentStatus if delivered
    if (orderStatus === "delivered" && order.paymentMethod === "cod") {
      order.paymentStatus = "completed";
    }

    // ─── 1. Automatic Refund Dispatch via Razorpay Gateway ────────────────────
    if (orderStatus === "refunded") {
      if (order.paymentMethod === "razorpay" && order.razorpayPaymentId) {
        try {
          const { refundRazorpayPayment } = require("./paymentController");
          await refundRazorpayPayment(order.razorpayPaymentId, order.totalAmount);
          order.paymentStatus = "refunded";
          order.statusTimeline.push({
            status: "refund_processed",
            at: new Date(),
            note: "Automatic refund processed successfully via Razorpay.",
          });
        } catch (refundErr) {
          console.error(`[RefundAutomation] Auto-refund failed for order ${order._id}:`, refundErr.message);
          order.statusTimeline.push({
            status: "refund_failed",
            at: new Date(),
            note: `Auto-refund via Razorpay failed: ${refundErr.message}. Manual processing required.`,
          });
        }
      } else {
        order.paymentStatus = "refunded";
      }
    }

    // Use findByIdAndUpdate with runValidators: false to bypass schema validation for older orders
    await Order.findByIdAndUpdate(order._id, {
      $set: {
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        statusTimeline: order.statusTimeline
      }
    }, { runValidators: false });

    // ─── 2. Trigger Status Update Notifications (Email, SMS, Web Push) ───────
    try {
      const populated = await Order.findById(order._id).populate(orderPopulate);
      const { sendOrderStatus, sendInvoiceEmail, sendRefundStatus, sendFeedbackRequest } = require("../services/email/emailService");
      const { sendOrderShippedSMS, sendOrderDeliveredSMS } = require("../services/smsService");
      const { sendPush, buildOrderStatusPayload } = require("../services/pushService");
      const PushSubscription = require("../models/PushSubscription.model");

      // A. Email Notifications
      if (orderStatus === "refunded") {
        await sendRefundStatus(populated, "completed", populated.totalAmount);
      } else {
        await sendOrderStatus(populated, orderStatus, {
          courier: populated.courierPartner,
          trackingNumber: populated.trackingNumber,
        });
        
        if (orderStatus === "delivered") {
          await sendInvoiceEmail(populated);
          // Feedback / Review request loop
          await sendFeedbackRequest(
            populated.shippingAddress?.email || populated.user?.email,
            populated.user?.name || "Valued Customer",
            populated
          );
        }
      }

      // B. SMS Notifications
      if (populated.shippingAddress?.phone) {
        if (orderStatus === "shipped") {
          await sendOrderShippedSMS(populated.shippingAddress.phone, {
            orderId: populated.orderId,
            courierPartner: populated.courierPartner,
            trackingNumber: populated.trackingNumber,
            estimatedDelivery: populated.estimatedDeliveryDate,
          });
        } else if (orderStatus === "delivered") {
          await sendOrderDeliveredSMS(populated.shippingAddress.phone, populated.orderId);
        }
      }

      // C. Web Push Notifications
      try {
        const sub = await PushSubscription.findOne({ user: populated.user?._id || populated.user });
        if (sub) {
          const payload = buildOrderStatusPayload(populated.orderId || populated._id.toString(), orderStatus);
          await sendPush({ endpoint: sub.endpoint, keys: sub.keys }, payload);
        }
      } catch (pushErr) {
        console.error("[PushAlert] Failed to send order status push:", pushErr.message);
      }

    } catch (err) {
      console.error("Order status update notification dispatch failed:", err.message);
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to: ${orderStatus}`,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const updateFulfillment = async (req, res, next) => {
  try {
    const { orderStatus, courierPartner, trackingNumber, estimatedDeliveryDate, packageWeight, packageDimensions, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) { res.status(404); throw new Error("Order not found"); }
    if (courierPartner !== undefined) order.courierPartner = courierPartner;
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    if (estimatedDeliveryDate !== undefined) order.estimatedDeliveryDate = estimatedDeliveryDate || null;
    if (packageWeight !== undefined) order.packageWeight = packageWeight;
    if (packageDimensions !== undefined) order.packageDimensions = packageDimensions;
    if (orderStatus) {
      const validStatuses = ["placed", "packed", "shipped", "out_for_delivery", "delivered", "cancelled", "refunded"];
      if (!validStatuses.includes(orderStatus)) { res.status(400); throw new Error("Invalid order status"); }
      order.orderStatus = orderStatus;
      if (orderStatus === "delivered" && order.paymentMethod === "cod") order.paymentStatus = "completed";
      order.statusTimeline.push({ status: orderStatus, at: new Date(), note: note || "" });
    }
    // Use $set update instead of order.save() to bypass MongoDB Atlas collection-level
    // validators that fail on older orders missing fields added in later schema versions.
    const updateFields = {};
    if (courierPartner !== undefined)        updateFields.courierPartner       = courierPartner;
    if (trackingNumber !== undefined)        updateFields.trackingNumber       = trackingNumber;
    if (estimatedDeliveryDate !== undefined) updateFields.estimatedDeliveryDate = estimatedDeliveryDate || null;
    if (packageWeight !== undefined)         updateFields.packageWeight        = packageWeight;
    if (packageDimensions !== undefined)     updateFields.packageDimensions    = packageDimensions;
    if (orderStatus) {
      updateFields.orderStatus    = orderStatus;
      updateFields.statusTimeline = order.statusTimeline; // already pushed above
      if (orderStatus === "delivered" && order.paymentMethod === "cod") {
        updateFields.paymentStatus = "completed";
      }
    }
    await Order.findByIdAndUpdate(order._id, { $set: updateFields }, { runValidators: false });
    const populated = await Order.findById(order._id).populate(orderPopulate);

    // Trigger fulfillment update emails
    try {
      const { sendOrderStatus, sendInvoiceEmail, sendRefundStatus, sendShippingLabelEmail } = require("../services/email/emailService");
      
      if (orderStatus) {
        if (orderStatus === "refunded") {
          await sendRefundStatus(populated, "completed", populated.totalAmount);
        } else {
          await sendOrderStatus(populated, orderStatus, {
            courier: populated.courierPartner,
            trackingNumber: populated.trackingNumber,
          });
          
          if (orderStatus === "delivered") {
            await sendInvoiceEmail(populated);
          }
          if (orderStatus === "shipped") {
            await sendShippingLabelEmail(populated, {
              courier: populated.courierPartner,
              trackingNumber: populated.trackingNumber,
              weight: populated.packageWeight,
              dimensions: populated.packageDimensions,
            });
          }
        }
      }
    } catch (err) {
      console.error("Fulfillment update email failed:", err.message);
    }

    res.status(200).json({ success: true, data: populated });
  } catch (error) { next(error); }
};

const recordDocumentEvent = async (req, res, next) => {
  try {
    let order = await Order.findById(req.params.id);
    if (!order) { res.status(404); throw new Error("Order not found"); }
    if (req.body.document === "invoice") order.printedInvoice = true;
    if (req.body.document === "label") order.printedLabel = true;
    order = await ensureInvoice(order);
    await order.save();
    res.status(200).json({ success: true, data: order });
  } catch (error) { next(error); }
};

const createGuestOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode, email, name } = req.body;
    const User = require("../models/User.model");

    // 1. Check or Create a guest user account
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = await User.create({
        name,
        email: email.toLowerCase(),
        isGuest: true,
        phone: shippingAddress.phone || undefined,
        isVerified: false,
      });
    }

    // 2. Validate items array & stock
    let subtotal = 0;
    const orderItems = [];
    const stockUpdates = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        res.status(404);
        throw new Error(`Product not found for item: ${item.product}`);
      }

      let matchedVariant = null;
      if (product.variants && product.variants.length > 0) {
        matchedVariant = product.variants.find(
          (v) =>
            v.size === (item.variant?.size || "") &&
            v.color === (item.variant?.color || "")
        );

        if (!matchedVariant) {
          res.status(400);
          throw new Error(
            `Variant (Size: ${item.variant?.size || "none"}, Color: ${item.variant?.color || "none"}) not found for product: ${product.name}`
          );
        }

        if (matchedVariant.stock < item.qty) {
          res.status(400);
          throw new Error(
            `Insufficient stock for product: ${product.name}. Available: ${matchedVariant.stock}, Requested: ${item.qty}`
          );
        }

        stockUpdates.push({
          productId: product._id,
          variantId: matchedVariant._id,
          qty: item.qty,
        });
      }

      const priceAtPurchase = product.discountPrice !== null ? product.discountPrice : product.price;
      subtotal += priceAtPurchase * item.qty;

      orderItems.push({
        product: product._id,
        variant: {
          size: item.variant?.size || "",
          color: item.variant?.color || "",
        },
        qty: item.qty,
        priceAtPurchase,
      });
    }

    // 3. Validate coupon code
    let discountAmount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      try {
        const { coupon, discountAmount: disc } = await validateCouponHelper(couponCode, subtotal);
        discountAmount = disc;
        appliedCoupon = coupon;
      } catch (err) {
        res.status(400);
        throw new Error(`Coupon validation failed: ${err.message}`);
      }
    }

    const totalAmount = subtotal - discountAmount;

    // 4. Setup Transaction
    let session = null;
    try {
      session = await mongoose.startSession();
      session.startTransaction();
    } catch (_) {
      session = null;
    }

    let order;
    try {
      const dbOptions = session ? { session } : {};

      // Create guest order
      [order] = await Order.create([{
        user: user._id,
        items: orderItems,
        shippingAddress,
        paymentMethod,
        paymentStatus: paymentMethod === "cod" ? "pending" : "completed",
        orderStatus: "placed",
        totalAmount,
      }], dbOptions);

      // Decrement product stock
      for (const update of stockUpdates) {
        const updateResult = await Product.updateOne(
          { _id: update.productId, "variants._id": update.variantId },
          { $inc: { "variants.$.stock": -update.qty } },
          dbOptions
        );
        if (updateResult.modifiedCount !== 1) {
          throw new Error(`Fulfillment stock adjustment failed for variant of ${update.productId}.`);
        }
      }

      if (session) {
        await session.commitTransaction();
        session.endSession();
      }
    } catch (txErr) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      throw txErr;
    }

    // Send confirmation emails
    try {
      const { sendOrderPlaced, notifyAdminNewOrder } = require("../services/email/emailService");
      await sendOrderPlaced(populated);
      await notifyAdminNewOrder({
        orderId: populated.orderId,
        customerName: name,
        amount: populated.totalAmount,
        paymentMethod: populated.paymentMethod,
      });

      // Asynchronously check stock thresholds
      checkInventoryLevels(orderItems);
    } catch (err) {
      console.error("Guest checkout email confirmation/alerts failed:", err.message);
    }

    res.status(201).json({
      success: true,
      message: "Guest order placed successfully.",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  createGuestOrder,
  getMyOrders,
  getOrderById,
  validateCoupon,
  getAllOrders,
  getAdminOrderById,
  updateOrderStatus,
  updateFulfillment,
  recordDocumentEvent,
};
