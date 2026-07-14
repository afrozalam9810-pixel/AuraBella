/**
 * reportsController.js
 * Admin-only reporting endpoints.
 *
 * Routes:
 *   GET /api/admin/reports/gst?year=2025&month=6
 *   GET /api/admin/reports/category-revenue?from=2025-01-01&to=2025-12-31
 */

const mongoose = require("mongoose");
const Order    = require("../models/Order.model");
const Product  = require("../models/Product.model");
const Category = require("../models/Category.model");

// ─── GST / Tax Report ────────────────────────────────────────────────────────
/**
 * @desc  Monthly GST collection report.
 *        Aggregates tax data from orders in a given month/year.
 * @route GET /api/admin/reports/gst
 * @query year  (default: current year)
 * @query month (1-12, default: current month)
 */
const getGSTReport = async (req, res, next) => {
  try {
    const now   = new Date();
    const year  = parseInt(req.query.year  || now.getFullYear(),  10);
    const month = parseInt(req.query.month || (now.getMonth() + 1), 10);

    if (month < 1 || month > 12) { res.status(400); throw new Error("month must be between 1 and 12"); }

    const from = new Date(year, month - 1, 1);
    const to   = new Date(year, month,     1); // exclusive upper bound (start of next month)

    // Pull all paid, delivered, or placed orders in the period
    const orders = await Order.find({
      createdAt:    { $gte: from, $lt: to },
      orderStatus:  { $nin: ["cancelled", "pending_payment"] },
      paymentStatus: "completed",
    }).populate("items.product", "name brand hsnCode gstRate price discountPrice");

    // Build per-HSN aggregation
    const hsnMap = {};   // key: hsnCode
    let totalTaxable = 0;
    let totalGST     = 0;
    let totalInvoiceValue = 0;

    for (const order of orders) {
      for (const item of order.items) {
        const prod    = item.product;
        const rate    = item.gstRate ?? prod?.gstRate ?? 0;
        const hsn     = item.hsnCode || prod?.hsnCode || "UNCLASSIFIED";
        const taxable = item.priceAtPurchase * item.qty;
        const gst     = parseFloat(((taxable * rate) / (100 + rate)).toFixed(2)); // backward GST from inclusive price
        const invoice = taxable;

        totalTaxable      += taxable - gst;
        totalGST          += gst;
        totalInvoiceValue += invoice;

        if (!hsnMap[hsn]) {
          hsnMap[hsn] = { hsnCode: hsn, gstRate: rate, taxableValue: 0, cgst: 0, sgst: 0, igst: 0, totalGST: 0, invoiceValue: 0 };
        }
        hsnMap[hsn].taxableValue  += taxable - gst;
        hsnMap[hsn].totalGST      += gst;
        hsnMap[hsn].cgst          += gst / 2;
        hsnMap[hsn].sgst          += gst / 2;
        hsnMap[hsn].invoiceValue  += invoice;
      }
    }

    const hsnBreakdown = Object.values(hsnMap).map((h) => ({
      ...h,
      taxableValue:  +h.taxableValue.toFixed(2),
      cgst:          +h.cgst.toFixed(2),
      sgst:          +h.sgst.toFixed(2),
      igst:          0,  // inter-state logic can be layered later
      totalGST:      +h.totalGST.toFixed(2),
      invoiceValue:  +h.invoiceValue.toFixed(2),
    }));

    res.status(200).json({
      success: true,
      period: { year, month, from, to },
      summary: {
        totalOrders:      orders.length,
        totalInvoiceValue: +totalInvoiceValue.toFixed(2),
        totalTaxable:      +totalTaxable.toFixed(2),
        totalGST:          +totalGST.toFixed(2),
        cgst:              +(totalGST / 2).toFixed(2),
        sgst:              +(totalGST / 2).toFixed(2),
      },
      hsnBreakdown,
    });
  } catch (err) { next(err); }
};

// ─── Category Revenue Report ─────────────────────────────────────────────────
/**
 * @desc  Revenue contribution by category for a date range.
 * @route GET /api/admin/reports/category-revenue
 * @query from (ISO date string, default: 30 days ago)
 * @query to   (ISO date string, default: now)
 */
const getCategoryRevenueReport = async (req, res, next) => {
  try {
    const to   = req.query.to   ? new Date(req.query.to)   : new Date();
    const from = req.query.from ? new Date(req.query.from) : new Date(to - 30 * 24 * 3600 * 1000);

    if (isNaN(from) || isNaN(to)) { res.status(400); throw new Error("Invalid date range"); }

    // Aggregate orders → items → product → category
    const result = await Order.aggregate([
      // 1. Filter completed orders in date range
      {
        $match: {
          createdAt:    { $gte: from, $lte: to },
          orderStatus:  { $nin: ["cancelled", "pending_payment"] },
          paymentStatus: "completed",
        },
      },
      // 2. Unwind items
      { $unwind: "$items" },
      // 3. Lookup product to get category ref
      {
        $lookup: {
          from:         "products",
          localField:   "items.product",
          foreignField: "_id",
          as:           "productDoc",
        },
      },
      { $unwind: { path: "$productDoc", preserveNullAndEmpty: false } },
      // 4. Group by category
      {
        $group: {
          _id:          "$productDoc.category",
          totalRevenue: { $sum: { $multiply: ["$items.priceAtPurchase", "$items.qty"] } },
          totalQty:     { $sum: "$items.qty" },
          orderCount:   { $sum: 1 },
        },
      },
      // 5. Lookup category name
      {
        $lookup: {
          from:         "categories",
          localField:   "_id",
          foreignField: "_id",
          as:           "categoryDoc",
        },
      },
      { $unwind: { path: "$categoryDoc", preserveNullAndEmpty: true } },
      // 6. Sort by revenue descending
      { $sort: { totalRevenue: -1 } },
      // 7. Project clean output
      {
        $project: {
          _id:          0,
          categoryId:   "$_id",
          categoryName: { $ifNull: ["$categoryDoc.name", "Uncategorised"] },
          categorySlug: { $ifNull: ["$categoryDoc.slug", ""] },
          totalRevenue: { $round: ["$totalRevenue", 2] },
          totalQty:     1,
          orderCount:   1,
        },
      },
    ]);

    const grandTotal = result.reduce((s, r) => s + r.totalRevenue, 0);

    const withShare = result.map((r) => ({
      ...r,
      revenueShare: grandTotal > 0 ? +((r.totalRevenue / grandTotal) * 100).toFixed(2) : 0,
    }));

    res.status(200).json({
      success: true,
      period: { from, to },
      summary: {
        grandTotalRevenue: +grandTotal.toFixed(2),
        categoriesCount:   result.length,
      },
      data: withShare,
    });
  } catch (err) { next(err); }
};

module.exports = { getGSTReport, getCategoryRevenueReport };
