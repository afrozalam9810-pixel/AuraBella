/**
 * order.schemas.js
 * Zod schemas for order creation and coupon validation.
 */

const { z } = require("zod");

// ─── Reusable sub-schemas ─────────────────────────────────────────────────────

const shippingAddressSchema = z.object({
  line1:    z.string({ required_error: "Address line 1 is required" }).trim().min(3, "Address line 1 is too short"),
  line2:    z.string().trim().optional().default(""),
  city:     z.string({ required_error: "City is required" }).trim().min(2),
  state:    z.string({ required_error: "State is required" }).trim().min(2),
  pincode:  z.string({ required_error: "Pincode is required" }).trim().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  phone:    z.string({ required_error: "Phone is required" }).trim().min(7, "Phone is too short"),
  name:     z.string().trim().optional().default(""),
  street:   z.string().trim().optional().default(""),
  area:     z.string().trim().optional().default(""),
  district: z.string().trim().optional().default(""),
  country:  z.string().trim().optional().default("India"),
});

const variantSchema = z.object({
  size:  z.string().trim().optional().default(""),
  color: z.string().trim().optional().default(""),
});

const orderItemSchema = z.object({
  product: z
    .string({ required_error: "Product ID is required" })
    .trim()
    .regex(/^[a-f\d]{24}$/i, "Product must be a valid MongoDB ObjectId"),
  variant: variantSchema.optional().default({}),
  qty: z
    .number({ required_error: "Quantity is required" })
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1")
    .max(10, "Cannot order more than 10 units of the same item"),
});

// ─── Order Schemas ────────────────────────────────────────────────────────────

const createOrder = z.object({
  items: z
    .array(orderItemSchema, { required_error: "Order items are required" })
    .min(1, "Order must contain at least one item")
    .max(20, "Order cannot contain more than 20 items"),
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(
    ["cod", "razorpay", "upi", "card", "stripe", "paypal"],
    { required_error: "Payment method is required", invalid_type_error: "Invalid payment method" }
  ),
  couponCode: z.string().trim().toUpperCase().optional(),
});

const createGuestOrder = z.object({
  items: z
    .array(orderItemSchema, { required_error: "Order items are required" })
    .min(1, "Order must contain at least one item")
    .max(20, "Order cannot contain more than 20 items"),
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(
    ["cod", "razorpay", "upi", "card", "stripe", "paypal"],
    { required_error: "Payment method is required", invalid_type_error: "Invalid payment method" }
  ),
  couponCode: z.string().trim().toUpperCase().optional(),
  email: z.string({ required_error: "Email is required" }).trim().toLowerCase().email("Please provide a valid email address"),
  name: z.string({ required_error: "Name is required" }).trim().min(2, "Name must be at least 2 characters"),
});

const validateCoupon = z.object({
  couponCode: z
    .string({ required_error: "Coupon code is required" })
    .trim()
    .toUpperCase()
    .min(3, "Coupon code is too short")
    .max(30, "Coupon code is too long"),
  cartTotal: z
    .number({ required_error: "Cart total is required" })
    .min(0, "Cart total cannot be negative"),
});

// ─── Payment Schemas ──────────────────────────────────────────────────────────

const createPaymentOrder = z.object({
  shippingAddress: shippingAddressSchema,
  couponCode: z.string().trim().toUpperCase().optional(),
});

const verifyPaymentSignature = z.object({
  razorpay_order_id:   z.string({ required_error: "Razorpay order ID is required" }).trim().min(1),
  razorpay_payment_id: z.string({ required_error: "Razorpay payment ID is required" }).trim().min(1),
  razorpay_signature:  z.string({ required_error: "Razorpay signature is required" }).trim().min(1),
});

module.exports = {
  createOrder,
  createGuestOrder,
  validateCoupon,
  createPaymentOrder,
  verifyPaymentSignature,
};
