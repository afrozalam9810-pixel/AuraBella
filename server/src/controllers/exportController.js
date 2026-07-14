const Order = require("../models/Order.model");
const User  = require("../models/User.model");
const csvCell = (val) => { const str = val === null || val === undefined ? "" : String(val); return str.includes(",") || str.includes('"') || str.includes("\n") ? `"${str.replace(/"/g, '""')}"` : str; };
const toCSV = (headers, rows) => { const lines = [headers.map(csvCell).join(",")]; for (const row of rows) lines.push(row.map(csvCell).join(",")); return lines.join("\r\n"); };
const exportOrders = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.from || req.query.to) { filter.createdAt = {}; if (req.query.from) filter.createdAt.$gte = new Date(req.query.from); if (req.query.to) filter.createdAt.$lte = new Date(req.query.to); }
    if (req.query.status) filter.orderStatus = req.query.status;
    const orders = await Order.find(filter).populate("user", "name email phone").sort({ createdAt: -1 }).limit(10000);
    const headers = ["Order ID","Short ID","Customer Name","Customer Email","Customer Phone","Order Status","Payment Status","Payment Method","Total Amount (INR)","Items Count","City","State","Pincode","Razorpay Order ID","Razorpay Payment ID","Created At"];
    const rows = orders.map((o) => [o._id, o.orderId || o._id.toString().slice(-8).toUpperCase(), o.user?.name||"Guest", o.user?.email||"", o.user?.phone||"", o.orderStatus, o.paymentStatus, o.paymentMethod, o.totalAmount?.toFixed(2), o.items?.length??0, o.shippingAddress?.city||"", o.shippingAddress?.state||"", o.shippingAddress?.pincode||"", o.razorpayOrderId||"", o.razorpayPaymentId||"", new Date(o.createdAt).toISOString()]);
    const csv = toCSV(headers, rows);
    const filename = `aurabella-orders-${new Date().toISOString().slice(0,10)}.csv`;
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send("\uFEFF" + csv);
  } catch (err) { next(err); }
};
const exportCustomers = async (req, res, next) => {
  try {
    const users = await User.find({ role: "customer" }).select("name email phone isVerified isActive createdAt").sort({ createdAt: -1 }).limit(50000);
    const headers = ["Name","Email","Phone","Email Verified","Active","Registered At"];
    const rows = users.map((u) => [u.name, u.email||"", u.phone||"", u.isVerified?"Yes":"No", u.isActive?"Yes":"No", new Date(u.createdAt).toISOString()]);
    const csv = toCSV(headers, rows);
    const filename = `aurabella-customers-${new Date().toISOString().slice(0,10)}.csv`;
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send("\uFEFF" + csv);
  } catch (err) { next(err); }
};
module.exports = { exportOrders, exportCustomers };
