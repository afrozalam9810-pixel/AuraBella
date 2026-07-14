/**
 * Order.model.js
 * Mongoose model for customer orders.
 */

const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: [true, "Product is required for order item"],
  },
  variant: {
    size: { type: String, default: "" },
    color: { type: String, default: "" },
  },
  qty: {
    type: Number,
    required: [true, "Quantity is required"],
    min: [1, "Quantity must be at least 1"],
  },
  priceAtPurchase: {
    type: Number,
    required: [true, "Price at purchase is required"],
    min: [0, "Price at purchase cannot be negative"],
  },
  hsnCode: { type: String, default: "" },
  gstRate: { type: Number, default: 0, min: 0, max: 100 },
});

const shippingAddressSchema = new mongoose.Schema({
  line1: { type: String, required: true },
  line2: { type: String, default: "" },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  phone: { type: String, required: true },
  name: { type: String, default: "" },
  street: { type: String, default: "" },
  area: { type: String, default: "" },
  district: { type: String, default: "" },
  country: { type: String, default: "India" },
});

const timelineSchema = new mongoose.Schema({
  status: { type: String, required: true },
  at: { type: Date, default: Date.now },
  note: { type: String, default: "" },
}, { _id: false });

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Order must belong to a user"],
    },
    items: {
      type: [orderItemSchema],
      required: [true, "Order must contain at least one item"],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "An order must contain at least one item",
      },
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: [true, "Shipping address is required"],
    },
    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
      enum: {
        values: ["card", "paypal", "cod", "upi", "stripe", "razorpay"],
        message: "Payment method must be card, paypal, cod, upi, stripe, or razorpay",
      },
    },
    paymentStatus: {
      type: String,
      default: "pending",
      enum: {
        values: ["pending", "completed", "failed", "refunded"],
        message: "Payment status must be pending, completed, failed, or refunded",
      },
    },
    razorpayOrderId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    razorpayPaymentId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    orderStatus: {
      type: String,
      default: "placed",
      enum: {
        values: ["pending_payment", "placed", "packed", "shipped", "out_for_delivery", "delivered", "cancelled", "refunded"],
        message: "Invalid order status",
      },
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },
    invoiceNumber: { type: String, unique: true, sparse: true, trim: true },
    invoiceDate: { type: Date, default: null },
    invoiceStatus: { type: String, enum: ["draft", "issued", "cancelled"], default: "draft" },
    printedInvoice: { type: Boolean, default: false },
    printedLabel: { type: Boolean, default: false },
    trackingNumber: { type: String, default: "", trim: true },
    courierPartner: { type: String, default: "", trim: true },
    estimatedDeliveryDate: { type: Date, default: null },
    packageWeight: { type: String, default: "" },
    packageDimensions: { type: String, default: "" },
    taxBreakdown: {
      gstRate: { type: Number, default: 0 },
      taxAmount: { type: Number, default: 0 },
      shippingCharges: { type: Number, default: 0 },
      platformFee: { type: Number, default: 0 },
      couponDiscount: { type: Number, default: 0 },
    },
    statusTimeline: { type: [timelineSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

// Indexes
orderSchema.index({ user: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
