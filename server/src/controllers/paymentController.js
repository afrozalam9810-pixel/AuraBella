const crypto = require("crypto");
const Cart = require("../models/Cart.model");
const Coupon = require("../models/Coupon.model");
const Order = require("../models/Order.model");
const Product = require("../models/Product.model");

const getRazorpayConfig = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
  }

  return { keyId, keySecret };
};

const createRazorpayOrder = async (options, keyId, keySecret) => {
  const authorization = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${authorization}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(options),
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.error?.description || "Razorpay could not create the payment order.");
  }

  return body;
};

const calculateCart = async (userId, couponCode) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart || cart.items.length === 0) {
    throw new Error("Your cart is empty. Cannot start payment.");
  }

  let subtotal = 0;
  const items = [];

  for (const cartItem of cart.items) {
    const product = await Product.findById(cartItem.product);
    if (!product) throw new Error("A product in your cart is no longer available.");

    const variant = product.variants.find(
      (item) => item.size === (cartItem.variant.size || "") && item.color === (cartItem.variant.color || "")
    );
    if (!variant || variant.stock < cartItem.qty) {
      throw new Error(`Insufficient stock for ${product.name}.`);
    }

    const priceAtPurchase = product.discountPrice ?? product.price;
    subtotal += priceAtPurchase * cartItem.qty;
    items.push({
      product: product._id,
      variant: { size: cartItem.variant.size, color: cartItem.variant.color },
      qty: cartItem.qty,
      priceAtPurchase,
    });
  }

  let discountAmount = 0;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
    if (!coupon || coupon.expiryDate <= new Date()) throw new Error("This coupon is invalid or expired.");
    if (subtotal < coupon.minOrderValue) throw new Error("Cart total does not meet this coupon's minimum order value.");
    discountAmount = coupon.discountType === "percentage"
      ? Math.round((subtotal * coupon.discountValue) / 100 * 100) / 100
      : coupon.discountValue;
    discountAmount = Math.min(discountAmount, subtotal);
  }

  return { cart, items, totalAmount: subtotal - discountAmount };
};

const validateShippingAddress = (shippingAddress) => {
  const required = ["line1", "city", "state", "pincode", "phone"];
  if (!shippingAddress || required.some((field) => !shippingAddress[field])) {
    throw new Error("A complete shipping address is required.");
  }
};

const createPaymentOrder = async (req, res, next) => {
  try {
    const { shippingAddress, couponCode } = req.body;
    validateShippingAddress(shippingAddress);

    const { cart, items, totalAmount } = await calculateCart(req.user._id, couponCode);
    const amount = Math.round(totalAmount * 100);
    if (amount < 1000) throw new Error("Razorpay payments must be at least ₹10.");

    const { keyId, keySecret } = getRazorpayConfig();
    const receipt = `ab_${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`;
    const razorpayOrder = await createRazorpayOrder(
      { amount, currency: "INR", receipt },
      keyId,
      keySecret
    );

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod: "razorpay",
      paymentStatus: "pending",
      orderStatus: "pending_payment",
      totalAmount,
      razorpayOrderId: razorpayOrder.id,
    });

    res.status(201).json({
      success: true,
      data: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId,
        orderId: order._id,
      },
    });
  } catch (err) {
    next(err);
  }
};

const verifyPaymentSignature = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400);
      throw new Error("Missing Razorpay verification details.");
    }

    const order = await Order.findOne({ user: req.user._id, razorpayOrderId: razorpay_order_id });
    if (!order) {
      res.status(404);
      throw new Error("The payment order was not found.");
    }
    if (order.paymentStatus === "completed") {
      res.status(200).json({ success: true, data: order });
      return;
    }

    const { keySecret } = getRazorpayConfig();
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${order.razorpayOrderId}|${razorpay_payment_id}`)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "utf8");
    const receivedBuffer = Buffer.from(razorpay_signature, "utf8");
    const signaturesMatch = expectedBuffer.length === receivedBuffer.length && crypto.timingSafeEqual(
      expectedBuffer,
      receivedBuffer
    );
    if (!signaturesMatch) {
      res.status(400);
      throw new Error("Invalid Razorpay payment signature.");
    }

    for (const item of order.items) {
      const update = await Product.updateOne(
        {
          _id: item.product,
          variants: { $elemMatch: { size: item.variant.size, color: item.variant.color, stock: { $gte: item.qty } } },
        },
        { $inc: { "variants.$.stock": -item.qty } }
      );
      if (update.modifiedCount !== 1) {
        res.status(409);
        throw new Error("Stock changed while your payment was processing. Contact support for assistance.");
      }
    }

    order.razorpayPaymentId = razorpay_payment_id;
    order.paymentStatus = "completed";
    order.orderStatus = "placed";
    await order.save();
    await Cart.updateOne({ user: req.user._id }, { $set: { items: [] } });

    res.status(200).json({ success: true, message: "Payment verified successfully.", data: order });
  } catch (err) {
    next(err);
  }
};

module.exports = { createPaymentOrder, verifyPaymentSignature };
