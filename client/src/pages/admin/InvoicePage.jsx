/**
 * InvoicePage.jsx
 * Standalone full-page invoice view at /admin/orders/:id/invoice
 * White background, A4 layout, print-optimized.
 *
 * Action bar (print-hidden): Back, Download PDF, Print Invoice
 */

import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiDownload, FiPrinter, FiMail, FiLoader } from "react-icons/fi";
import api from "../../api/axios";
import InvoiceDocument from "../../components/Invoice/InvoiceDocument";
import { downloadInvoicePdf } from "../../utils/documentPdf";

export default function InvoicePage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const invoiceRef = useRef(null);

  // Load order with invoice number ensured
  useEffect(() => {
    document.title = "Invoice | AuraBella Admin";
    setLoading(true);
    api
      .get(`/admin/orders/${id}`)
      .then(({ data }) => {
        setOrder(data.data);
        if (data.data?.invoiceNumber) {
          document.title = `${data.data.invoiceNumber} | AuraBella Invoice`;
        }
      })
      .catch(() => setError("Could not load order. Please go back and try again."))
      .finally(() => setLoading(false));
  }, [id]);

  // Record print event
  const recordEvent = () =>
    api.post(`/admin/orders/${id}/document-events`, { document: "invoice" }).catch(() => {});

  // Download PDF handler
  const handleDownloadPdf = async () => {
    if (!invoiceRef.current || downloading) return;
    setDownloading(true);
    recordEvent();
    try {
      await downloadInvoicePdf(invoiceRef.current, `${order.invoiceNumber || id}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  // Print handler — opens print dialog on the current page
  const handlePrint = () => {
    recordEvent();
    window.print();
  };

  // Email handler
  const emailUrl = order
    ? `mailto:${order.user?.email || ""}?subject=${encodeURIComponent(
        `Your AuraBella Invoice ${order.invoiceNumber}`
      )}&body=${encodeURIComponent(
        `Dear ${order.user?.name || "Customer"},\n\nThank you for your order!\n\nYour invoice number is ${order.invoiceNumber}.\nOrder total: ₹${order.totalAmount?.toLocaleString("en-IN")}.\n\nFor any queries, please contact support@aurabellaafroz.com.\n\nWarm regards,\nTeam AuraBella`
      )}`
    : "#";

  // ── Loading state ──
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="text-4xl text-primary-400 animate-spin mx-auto mb-4" />
          <p className="font-serif italic text-[#9d8bbb]">Preparing invoice…</p>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center p-6">
        <div className="glass-card p-8 max-w-md text-center">
          <p className="text-rose-300 font-semibold mb-4">{error}</p>
          <Link to={`/admin/orders/${id}`} className="btn-outline !px-6 !py-2">
            <FiArrowLeft /> Go Back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0ebf5]">

      {/* ── Action Bar (hidden on print) ── */}
      <div
        className="print-hidden sticky top-0 z-40 bg-dark-800 border-b border-white/5 px-6 py-3 flex items-center gap-3 flex-wrap shadow-lg"
      >
        {/* Back button */}
        <Link
          to={`/admin/orders/${id}`}
          className="flex items-center gap-2 text-xs font-semibold text-primary-300 hover:text-white uppercase tracking-wider transition-colors mr-4"
        >
          <FiArrowLeft /> Back to Order
        </Link>

        {/* Invoice label */}
        <div className="flex-grow">
          <span className="font-display font-bold text-white text-sm">
            Invoice: {order?.invoiceNumber || "Loading…"}
          </span>
          <span className="text-[#9d8bbb] text-xs ml-3 font-sans">
            Order #{order?._id?.slice(-8)}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="btn-primary !px-5 !py-2 !text-xs flex items-center gap-2"
          >
            <FiDownload className={downloading ? "animate-bounce" : ""} />
            {downloading ? "Generating…" : "Download PDF"}
          </button>

          <button
            onClick={handlePrint}
            className="btn-outline !px-5 !py-2 !text-xs flex items-center gap-2"
          >
            <FiPrinter /> Print Invoice
          </button>

          <a
            href={emailUrl}
            className="btn-outline !px-5 !py-2 !text-xs flex items-center gap-2"
          >
            <FiMail /> Email Invoice
          </a>
        </div>
      </div>

      {/* ── Invoice Document ── */}
      <div className="py-8 px-4">
        {/* Hidden capture ref for PDF */}
        <div ref={invoiceRef}>
          {order && <InvoiceDocument order={order} />}
        </div>
      </div>
    </div>
  );
}
