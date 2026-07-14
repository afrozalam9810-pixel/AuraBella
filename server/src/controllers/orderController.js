/**
 * orderController.js
 * Controller for managing customer orders and coupon validation.
 */

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

    // 5. Create the Order
    const order = await Order.create({
      user: userId,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "completed", // Simplification
      orderStatus: "placed",
      totalAmount,
    });

    // 6. Update Product Stock (Decrement)
    for (const update of stockUpdates) {
      await Product.updateOne(
        { _id: update.productId, "variants._id": update.variantId },
        { $inc: { "variants.$.stock": -update.qty } }
      );
    }

    // 7. Clear the User's Cart
    cart.items = [];
    await cart.save();

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
    order = await ensureInvoice(order);
    await order.populate(orderPopulate);
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

    await order.save();

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
    await order.save();
    const populated = await Order.findById(order._id).populate(orderPopulate);
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

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  validateCoupon,
  getAllOrders,
  getAdminOrderById,
  updateOrderStatus,
  updateFulfillment,
  recordDocumentEvent,
};
