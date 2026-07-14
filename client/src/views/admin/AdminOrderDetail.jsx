/**
 * AdminOrderDetail.jsx
 * Full professional order management dashboard for a single order.
 *
 * Sections:
 *   1. Header — Order ID, invoice number, action buttons
 *   2. Customer Details card
 *   3. Shipping Address card
 *   4. Order Information card
 *   5. Products table (with image, SKU, variant, pricing, GST)
 *   6. Price Summary
 *   7. Fulfillment Form (courier, tracking, status)
 *   8. Order Timeline (vertical, Flipkart-style)
 *   9. Shipping Label preview + download/print
 */

import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FiArrowLeft, FiDownload, FiFileText, FiPrinter, FiMail,
  FiPackage, FiTruck, FiCheck, FiX, FiAlertCircle, FiClock,
  FiMapPin, FiUser, FiCreditCard, FiShoppingBag, FiRefreshCw,
  FiLoader, FiChevronRight,
} from "react-icons/fi";
import api from "../../api/axios";
import InvoiceDocument from "../../components/Invoice/InvoiceDocument";
import ShippingLabel from "../../components/Invoice/ShippingLabel";
import { downloadInvoicePdf, downloadLabelPdf } from "../../utils/documentPdf";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_META = {
  pending_payment: { label: "Payment Pending",    color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", icon: <FiClock /> },
  placed:          { label: "Order Placed",        color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20",    icon: <FiShoppingBag /> },
  packed:          { label: "Packed",              color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20",icon: <FiPackage /> },
  shipped:         { label: "Shipped",             color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20",icon: <FiTruck /> },
  out_for_delivery:{ label: "Out for Delivery",    color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20",icon: <FiTruck /> },
  delivered:       { label: "Delivered",           color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20",  icon: <FiCheck /> },
  cancelled:       { label: "Cancelled",           color: "text-rose-400",   bg: "bg-rose-500/10 border-rose-500/20",    icon: <FiX /> },
  refunded:        { label: "Refunded",            color: "text-gray-400",   bg: "bg-gray-500/10 border-gray-500/20",    icon: <FiRefreshCw /> },
};

// The ordered progression for the timeline
const TIMELINE_FLOW = [
  "placed", "packed", "shipped", "out_for_delivery", "delivered",
];

const PAYMENT_STATUS_COLOR = {
  pending:   "text-yellow-400",
  completed: "text-green-400",
  failed:    "text-rose-400",
  refunded:  "text-gray-400",
};

const money = (v) =>
  `₹${Number(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Section card wrapper */
function Card({ title, icon, children, className = "" }) {
  return (
    <section className={`glass-card p-5 flex flex-col gap-4 ${className}`}>
      {title && (
        <h2 className="font-bold text-sm text-white flex items-center gap-2 border-b border-white/5 pb-3">
          <span className="text-primary-400 text-base">{icon}</span>
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

/** Key-Value detail row */
function DetailRow({ label, value, valueClass = "" }) {
  return (
    <div className="flex justify-between items-start gap-3 py-1 border-b border-white/5 last:border-0">
      <span className="text-[#9d8bbb] text-[10px] font-semibold uppercase tracking-wider flex-shrink-0">
        {label}
      </span>
      <span className={`text-xs text-right ${valueClass || "text-white"}`}>
        {value || <span className="text-white/30">—</span>}
      </span>
    </div>
  );
}

/** Vertical Flipkart-style order timeline */
function OrderTimeline({ order }) {
  // Merge the initial "placed" event with statusTimeline
  const timelineEvents = [
    { status: "placed", at: order.createdAt, note: "Order successfully placed" },
    ...(order.statusTimeline || []),
  ];

  // Determine if each step in TIMELINE_FLOW has been reached
  const reachedStatuses = new Set(timelineEvents.map((e) => e.status));
  const currentStatus = order.orderStatus;
  const currentIdx = TIMELINE_FLOW.indexOf(currentStatus);

  return (
    <div className="flex flex-col gap-0">
      {TIMELINE_FLOW.map((status, i) => {
        const meta = STATUS_META[status] || {};
        const event = timelineEvents.find((e) => e.status === status);
        const isDone = reachedStatuses.has(status);
        const isCurrent = status === currentStatus;
        const isLast = i === TIMELINE_FLOW.length - 1;

        return (
          <div key={status} className="flex gap-3">
            {/* Left: dot + connector line */}
            <div className="flex flex-col items-center">
              <div className={isDone ? "timeline-dot-done" : "timeline-dot-pending"}>
                {isDone && (
                  <FiCheck className="text-white text-xs" />
                )}
              </div>
              {!isLast && (
                <div
                  className={`w-0.5 flex-grow my-1 ${isDone ? "bg-gradient-to-b from-primary-500 to-primary-800" : "bg-white/10"}`}
                  style={{ minHeight: "28px" }}
                />
              )}
            </div>

            {/* Right: status info */}
            <div className={`pb-5 ${isLast ? "pb-0" : ""}`}>
              <p className={`text-xs font-bold ${isDone ? meta.color : "text-white/30"} flex items-center gap-1.5`}>
                {isCurrent && <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />}
                {meta.label || status}
              </p>
              {event ? (
                <>
                  <p className="text-[10px] text-[#9d8bbb] mt-0.5">
                    {new Date(event.at).toLocaleString("en-IN", {
                      day: "2-digit", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                  {event.note && (
                    <p className="text-[9px] text-white/40 italic mt-0.5">{event.note}</p>
                  )}
                </>
              ) : (
                <p className="text-[10px] text-white/20 mt-0.5 italic">Pending</p>
              )}
            </div>
          </div>
        );
      })}

      {/* Show cancelled / refunded if applicable */}
      {(order.orderStatus === "cancelled" || order.orderStatus === "refunded") && (
        <div className="flex gap-3 mt-1">
          <div className="flex flex-col items-center">
            <div className="timeline-dot-done" style={{ background: order.orderStatus === "cancelled" ? "#e11d50" : "#6b7280" }}>
              <FiX className="text-white text-xs" />
            </div>
          </div>
          <div>
            <p className={`text-xs font-bold ${STATUS_META[order.orderStatus]?.color}`}>
              {STATUS_META[order.orderStatus]?.label}
            </p>
            {(order.statusTimeline || [])
              .filter((e) => e.status === order.orderStatus)
              .slice(-1)
              .map((e) => (
                <p key={e.at} className="text-[10px] text-[#9d8bbb] mt-0.5">
                  {new Date(e.at).toLocaleString("en-IN", {
                    day: "2-digit", month: "short", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [saving, setSaving]       = useState(false);
  const [saveMsg, setSaveMsg]     = useState("");
  const [saveErr, setSaveErr]     = useState("");
  const [dlgInvoice, setDlgInvoice] = useState(false);
  const [dlgLabel, setDlgLabel]   = useState(false);

  const [form, setForm] = useState({
    orderStatus:           "",
    courierPartner:        "",
    trackingNumber:        "",
    estimatedDeliveryDate: "",
    packageWeight:         "",
    packageDimensions:     "",
  });

  const invoiceRef = useRef(null);
  const labelRef   = useRef(null);

  // ── Load order ──
  const loadOrder = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/admin/orders/${id}`);
      const o = data.data;
      setOrder(o);
      setForm({
        orderStatus:           o.orderStatus            || "",
        courierPartner:        o.courierPartner         || "",
        trackingNumber:        o.trackingNumber         || "",
        estimatedDeliveryDate: o.estimatedDeliveryDate?.slice(0, 10) || "",
        packageWeight:         o.packageWeight          || "",
        packageDimensions:     o.packageDimensions      || "",
      });
    } catch (e) {
      setError(e.response?.data?.message || "Could not load the order.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Order Detail | AuraBella Admin";
    loadOrder();
  }, [id]);

  // ── Record document print/download event ──
  const recordEvent = (document) =>
    api.post(`/admin/orders/${id}/document-events`, { document }).catch(() => {});

  // ── Save fulfillment form ──
  const saveFulfillment = async () => {
    setSaving(true);
    setSaveMsg("");
    setSaveErr("");
    try {
      const { data } = await api.put(`/admin/orders/${id}/fulfillment`, form);
      setOrder(data.data);
      setSaveMsg("Fulfillment details saved successfully!");
      setTimeout(() => setSaveMsg(""), 3500);
    } catch (e) {
      setSaveErr(e.response?.data?.message || "Could not save fulfillment details.");
    } finally {
      setSaving(false);
    }
  };

  // ── Quick status update ──
  const quickStatus = async (newStatus) => {
    setSaveErr("");
    try {
      const { data } = await api.put(`/admin/orders/${id}/fulfillment`, {
        ...form,
        orderStatus: newStatus,
      });
      setOrder(data.data);
      setForm((f) => ({ ...f, orderStatus: newStatus }));
      setSaveMsg(`Status updated to: ${STATUS_META[newStatus]?.label || newStatus}`);
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (e) {
      setSaveErr(e.response?.data?.message || "Could not update status.");
    }
  };

  // ── Download invoice PDF ──
  const handleDownloadInvoice = async () => {
    if (!invoiceRef.current) return;
    recordEvent("invoice");
    setDlgInvoice(true);
    try {
      await downloadInvoicePdf(invoiceRef.current, `${order.invoiceNumber || id}.pdf`);
    } finally {
      setDlgInvoice(false);
    }
  };

  // ── Download label PDF ──
  const handleDownloadLabel = async () => {
    if (!labelRef.current) return;
    recordEvent("label");
    setDlgLabel(true);
    try {
      await downloadLabelPdf(labelRef.current, `label-${order.invoiceNumber || id}.pdf`);
    } finally {
      setDlgLabel(false);
    }
  };

  // ── Print helper ──
  const printRef = (ref, title) => {
    recordEvent(title === "invoice" ? "invoice" : "label");
    const content = ref.current?.innerHTML;
    if (!content) return;
    const tab = window.open("", "_blank");
    tab.document.write(`
      <html>
        <head>
          <title>AuraBella ${title}</title>
          <style>
            body { margin: 0; background: #fff; }
            @media print { body { margin: 0; } }
            .invoice-document { box-sizing: border-box; }
            .shipping-label { margin: 10mm auto; }
            .invoice-table { border-collapse: collapse; width: 100%; font-size: 9.5px; }
            .invoice-table th, .invoice-table td { padding: 6px 8px; }
            .invoice-table tbody tr:nth-child(even) { background: #faf7fc; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    tab.document.close();
    tab.focus();
    setTimeout(() => tab.print(), 400);
  };

  // ── Email handler ──
  const emailUrl = order
    ? `mailto:${order.user?.email || ""}?subject=${encodeURIComponent(
        `Your AuraBella Invoice ${order.invoiceNumber}`
      )}&body=${encodeURIComponent(
        `Dear ${order.user?.name || "Customer"},\n\nThank you for your order!\n\nInvoice: ${order.invoiceNumber}\nOrder Total: ₹${order.totalAmount?.toLocaleString("en-IN")}\n\nFor any queries: support@aurabellaafroz.com\n\nWarm regards,\nTeam AuraBella`
      )}`
    : "#";

  // ─────────────────────────────────────────────────────────────────────────────
  // ── Loading / Error states ──
  // ─────────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <FiLoader className="text-4xl text-primary-400 animate-spin mx-auto mb-4" />
          <p className="font-serif italic text-[#9d8bbb] text-sm">Loading order details…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 items-start">
        <Link to="/admin/orders" className="btn-outline !px-4 !py-2 text-xs">
          <FiArrowLeft /> Back to Orders
        </Link>
        <div className="glass-card p-6 text-rose-300 flex items-center gap-2 text-sm">
          <FiAlertCircle /> {error}
        </div>
      </div>
    );
  }

  // ── Derived values ──
  const items = order.items || [];
  const subtotal = items.reduce((sum, item) => sum + (item.priceAtPurchase || 0) * item.qty, 0);
  const discount = Math.max(0, subtotal - (order.totalAmount || 0));
  const couponDiscount = order.taxBreakdown?.couponDiscount || 0;
  const shippingCharges = order.taxBreakdown?.shippingCharges || 0;
  const taxTotal = order.taxBreakdown?.taxAmount || 0;
  const grandTotal = order.totalAmount || 0;
  const amountPaid = order.paymentStatus === "completed" ? grandTotal : 0;
  const statusMeta = STATUS_META[order.orderStatus] || {};
  const addr = order.shippingAddress || {};

  const isTerminal = ["delivered", "cancelled", "refunded"].includes(order.orderStatus);

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 font-sans text-xs pb-16">

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 1. PAGE HEADER                                                        */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-wrap gap-4 justify-between items-start border-b border-white/5 pb-5">
        <div>
          <Link to="/admin/orders" className="flex items-center gap-1.5 text-primary-300 hover:text-white transition-colors text-[10px] uppercase tracking-wider font-semibold mb-2 w-fit">
            <FiArrowLeft /> All Orders
          </Link>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-white tracking-wide">
            Order #{order._id.slice(-8)}
          </h1>
          <p className="font-serif italic text-[#9d8bbb] text-xs mt-0.5">
            Invoice: <strong className="text-primary-300">{order.invoiceNumber || "Generating…"}</strong>
            {" · "}
            {new Date(order.createdAt).toLocaleString("en-IN", {
              day: "2-digit", month: "short", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            })}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 items-center">
          <Link
            to={`/admin/orders/${id}/invoice`}
            className="btn-outline !px-4 !py-2 !text-xs flex items-center gap-1.5"
          >
            <FiFileText /> View Invoice
          </Link>
          <button
            onClick={handleDownloadInvoice}
            disabled={dlgInvoice}
            className="btn-outline !px-4 !py-2 !text-xs flex items-center gap-1.5"
          >
            <FiDownload className={dlgInvoice ? "animate-bounce" : ""} />
            {dlgInvoice ? "Generating…" : "Download PDF"}
          </button>
          <button
            onClick={() => printRef(invoiceRef, "invoice")}
            className="btn-outline !px-4 !py-2 !text-xs flex items-center gap-1.5"
          >
            <FiPrinter /> Print Invoice
          </button>
          <a href={emailUrl} className="btn-outline !px-4 !py-2 !text-xs flex items-center gap-1.5">
            <FiMail /> Email Invoice
          </a>
        </div>
      </div>

      {/* Save messages */}
      {saveMsg && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl px-4 py-3 flex items-center gap-2 text-xs">
          <FiCheck /> {saveMsg}
        </div>
      )}
      {saveErr && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl px-4 py-3 flex items-center gap-2 text-xs">
          <FiAlertCircle /> {saveErr}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* Quick Status Action Buttons                                           */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {!isTerminal && (
        <div className="flex flex-wrap gap-2">
          {order.orderStatus === "placed" && (
            <button
              onClick={() => quickStatus("packed")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 font-bold uppercase tracking-wider text-[10px] transition-colors"
            >
              <FiPackage /> Mark Packed
            </button>
          )}
          {(order.orderStatus === "placed" || order.orderStatus === "packed") && (
            <button
              onClick={() => quickStatus("shipped")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 font-bold uppercase tracking-wider text-[10px] transition-colors"
            >
              <FiTruck /> Mark Shipped
            </button>
          )}
          {order.orderStatus === "shipped" && (
            <button
              onClick={() => quickStatus("out_for_delivery")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300 hover:bg-orange-500/20 font-bold uppercase tracking-wider text-[10px] transition-colors"
            >
              <FiTruck /> Out for Delivery
            </button>
          )}
          {order.orderStatus === "out_for_delivery" && (
            <button
              onClick={() => quickStatus("delivered")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-300 hover:bg-green-500/20 font-bold uppercase tracking-wider text-[10px] transition-colors"
            >
              <FiCheck /> Mark Delivered
            </button>
          )}
          <button
            onClick={() => quickStatus("cancelled")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20 font-bold uppercase tracking-wider text-[10px] transition-colors"
          >
            <FiX /> Cancel Order
          </button>
          {order.paymentStatus === "completed" && (
            <button
              onClick={() => quickStatus("refunded")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-500/10 border border-gray-500/20 text-gray-300 hover:bg-gray-500/20 font-bold uppercase tracking-wider text-[10px] transition-colors"
            >
              <FiRefreshCw /> Refund Order
            </button>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 2+3+4. Info Cards Row                                                 */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* 2. Customer Details */}
        <Card title="Customer Details" icon={<FiUser />}>
          <DetailRow label="Name"        value={order.user?.name} valueClass="text-white font-semibold" />
          <DetailRow label="Email"       value={order.user?.email} />
          <DetailRow label="Phone"       value={addr.phone || order.user?.phone} />
          <DetailRow label="Customer ID" value={order.user?._id?.slice(-10)} />
          <DetailRow
            label="Order Date"
            value={new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit", month: "short", year: "numeric",
            })}
          />
          <DetailRow
            label="Order Time"
            value={new Date(order.createdAt).toLocaleTimeString("en-IN", {
              hour: "2-digit", minute: "2-digit",
            })}
          />
        </Card>

        {/* 3. Shipping Address */}
        <Card title="Shipping Address" icon={<FiMapPin />}>
          <div className="flex flex-col gap-1 text-xs">
            {[
              { label: "Name",        value: addr.name || order.user?.name },
              { label: "Phone",       value: addr.phone },
              { label: "House/Apt",   value: addr.line1 },
              { label: "Street",      value: addr.line2 || addr.street },
              { label: "Area",        value: addr.area },
              { label: "City",        value: addr.city },
              { label: "District",    value: addr.district },
              { label: "State",       value: addr.state },
              { label: "Country",     value: addr.country || "India" },
              { label: "Pincode",     value: addr.pincode },
            ].map(({ label, value }) => (
              value ? (
                <div key={label} className="flex justify-between border-b border-white/5 py-1 last:border-0">
                  <span className="text-[#9d8bbb] text-[10px] font-semibold uppercase tracking-wider w-20 flex-shrink-0">{label}</span>
                  <span className="text-white text-right">{value}</span>
                </div>
              ) : null
            ))}
          </div>
        </Card>

        {/* 4. Order Information */}
        <Card title="Order Information" icon={<FiShoppingBag />}>
          <DetailRow label="Order ID"      value={`#${order._id.slice(-12)}`} />
          <DetailRow label="Invoice No."   value={order.invoiceNumber || "Pending"} valueClass="text-primary-300 font-bold" />
          <DetailRow label="Payment"       value={order.paymentMethod?.toUpperCase()} />
          <DetailRow
            label="Pay Status"
            value={order.paymentStatus}
            valueClass={`capitalize font-bold ${PAYMENT_STATUS_COLOR[order.paymentStatus]}`}
          />
          <DetailRow
            label="Order Status"
            value={
              <span className={`badge text-[9px] border capitalize ${statusMeta.bg}`}>
                {statusMeta.label || order.orderStatus}
              </span>
            }
          />
          <DetailRow label="Courier"        value={order.courierPartner || "—"} />
          <DetailRow label="Tracking"       value={order.trackingNumber || "—"} />
          <DetailRow
            label="Est. Delivery"
            value={
              order.estimatedDeliveryDate
                ? new Date(order.estimatedDeliveryDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                : "—"
            }
          />
        </Card>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 5. Products Table                                                     */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <Card title="Ordered Products" icon={<FiShoppingBag />}>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[#9d8bbb] text-[10px] uppercase tracking-wider">
                <th className="py-3 px-2">Product</th>
                <th className="py-3 px-2">SKU</th>
                <th className="py-3 px-2">Size</th>
                <th className="py-3 px-2">Color</th>
                <th className="py-3 px-2 text-center">Qty</th>
                <th className="py-3 px-2 text-right">MRP</th>
                <th className="py-3 px-2 text-right">Selling Price</th>
                <th className="py-3 px-2 text-right">Discount</th>
                <th className="py-3 px-2 text-center">GST%</th>
                <th className="py-3 px-2 text-right">Tax Amt</th>
                <th className="py-3 px-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const product = item.product || {};
                const mrp = product.price || item.priceAtPurchase || 0;
                const sellingPrice = item.priceAtPurchase || 0;
                const disc = Math.max(0, mrp - sellingPrice);
                const gstRate = item.gstRate ?? product.gstRate ?? 0;
                const lineTotal = sellingPrice * item.qty;
                const taxAmt = Number(((lineTotal * gstRate) / (100 + gstRate)).toFixed(2));

                return (
                  <tr key={item._id} className="border-b border-white/5 last:border-0 hover:bg-white/3">
                    {/* Product */}
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-12 rounded-lg overflow-hidden border border-white/10 bg-dark-900 flex-shrink-0">
                          <img
                            src={product.images?.[0] || `https://placehold.co/40x50/1e1830/f0e8ff?text=P`}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-white leading-tight">{product.name || "Product Item"}</p>
                          <p className="text-[9px] text-[#9d8bbb] mt-0.5">{product.brand || "AuraBella"}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-2 text-[#9d8bbb]">
                      <div>{product.productId || "—"}</div>
                      <div className="text-[9px]">HSN: {item.hsnCode || product.hsnCode || "—"}</div>
                    </td>
                    <td className="py-3 px-2 text-[#9d8bbb]">{item.variant?.size || "—"}</td>
                    <td className="py-3 px-2 text-[#9d8bbb]">{item.variant?.color || "—"}</td>
                    <td className="py-3 px-2 text-center font-bold text-white">{item.qty}</td>
                    <td className="py-3 px-2 text-right text-[#9d8bbb] line-through">{money(mrp)}</td>
                    <td className="py-3 px-2 text-right text-white font-semibold">{money(sellingPrice)}</td>
                    <td className="py-3 px-2 text-right text-green-400">{disc > 0 ? `- ${money(disc)}` : "—"}</td>
                    <td className="py-3 px-2 text-center text-[#9d8bbb]">{gstRate}%</td>
                    <td className="py-3 px-2 text-right text-[#9d8bbb]">{money(taxAmt)}</td>
                    <td className="py-3 px-2 text-right font-bold text-white">{money(lineTotal)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 6. Price Summary                                                      */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div className="flex justify-end">
        <Card title="Price Summary" icon={<FiCreditCard />} className="w-full max-w-sm">
          {[
            { label: "Items Subtotal",   value: money(subtotal),          cls: "" },
            discount > 0 && { label: "Product Discount", value: `- ${money(discount)}`,  cls: "text-green-400" },
            couponDiscount > 0 && { label: "Coupon Discount",  value: `- ${money(couponDiscount)}`, cls: "text-green-400" },
            { label: "Shipping Charges", value: shippingCharges > 0 ? money(shippingCharges) : "FREE", cls: shippingCharges === 0 ? "text-green-400" : "" },
            taxTotal > 0 && { label: "GST (included)",   value: money(taxTotal),          cls: "text-[#9d8bbb]" },
          ]
            .filter(Boolean)
            .map(({ label, value, cls }) => (
              <div key={label} className="flex justify-between py-1.5 border-b border-white/5 last:border-0">
                <span className="text-[#9d8bbb]">{label}</span>
                <span className={cls || "text-white"}>{value}</span>
              </div>
            ))}

          <div className="flex justify-between pt-3 border-t border-primary-500/30 mt-1">
            <span className="font-bold text-sm text-white uppercase tracking-wider">Grand Total</span>
            <span className="font-bold text-sm gradient-text">{money(grandTotal)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-[#9d8bbb]">Amount Paid</span>
            <span className={`font-semibold ${amountPaid > 0 ? "text-green-400" : "text-[#9d8bbb]"}`}>
              {money(amountPaid)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#9d8bbb]">Amount Due</span>
            <span className={`font-semibold ${grandTotal - amountPaid > 0 ? "text-rose-400" : "text-[#9d8bbb]"}`}>
              {money(grandTotal - amountPaid)}
            </span>
          </div>
        </Card>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 7+8. Fulfillment Form + Order Timeline (side by side on large screens)*/}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* 7. Fulfillment Form */}
        <Card title="Fulfillment & Delivery" icon={<FiTruck />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: "courierPartner",        label: "Courier Partner",      type: "text" },
              { key: "trackingNumber",        label: "Tracking Number",      type: "text" },
              { key: "estimatedDeliveryDate", label: "Estimated Delivery",   type: "date" },
              { key: "packageWeight",         label: "Package Weight (kg)",  type: "text" },
              { key: "packageDimensions",     label: "Dimensions (L×W×H cm)", type: "text" },
            ].map(({ key, label, type }) => (
              <label key={key} className="flex flex-col gap-1">
                <span className="text-[#9d8bbb] text-[10px] uppercase tracking-wider font-semibold">{label}</span>
                <input
                  type={type}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-primary-400 transition-colors"
                />
              </label>
            ))}

            {/* Status select */}
            <label className="flex flex-col gap-1">
              <span className="text-[#9d8bbb] text-[10px] uppercase tracking-wider font-semibold">Order Status</span>
              <select
                value={form.orderStatus}
                onChange={(e) => setForm({ ...form, orderStatus: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-primary-400 transition-colors"
              >
                {Object.entries(STATUS_META).map(([v, meta]) => (
                  <option key={v} value={v}>{meta.label}</option>
                ))}
              </select>
            </label>
          </div>

          <button
            onClick={saveFulfillment}
            disabled={saving}
            className="btn-primary !px-6 !py-2.5 !text-xs mt-2 w-fit flex items-center gap-2"
          >
            {saving ? <FiLoader className="animate-spin" /> : <FiPackage />}
            {saving ? "Saving…" : "Save Fulfillment Details"}
          </button>
        </Card>

        {/* 8. Order Timeline */}
        <Card title="Order Timeline" icon={<FiClock />}>
          <OrderTimeline order={order} />
        </Card>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 9. Shipping Label Section                                             */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <Card title="Shipping Label" icon={<FiPackage />}>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={handleDownloadLabel}
            disabled={dlgLabel}
            className="btn-outline !px-4 !py-2 !text-xs flex items-center gap-1.5"
          >
            <FiDownload className={dlgLabel ? "animate-bounce" : ""} />
            {dlgLabel ? "Generating…" : "Download Label PDF"}
          </button>
          <button
            onClick={() => printRef(labelRef, "label")}
            className="btn-outline !px-4 !py-2 !text-xs flex items-center gap-1.5"
          >
            <FiPrinter /> Print Label
          </button>
        </div>

        {/* Label preview */}
        <div className="bg-[#f5f0fa] rounded-xl p-4 overflow-auto">
          <div ref={labelRef} className="inline-block">
            <ShippingLabel order={order} />
          </div>
        </div>
      </Card>

      {/* ── Hidden off-screen invoice capture div for PDF ── */}
      <div
        style={{
          position: "fixed",
          top: "-9999px",
          left: "-9999px",
          width: "210mm",
          pointerEvents: "none",
          zIndex: -1,
        }}
      >
        <div ref={invoiceRef}>
          <InvoiceDocument order={order} />
        </div>
      </div>
    </div>
  );
}
