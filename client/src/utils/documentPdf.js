/**
 * documentPdf.js
 * Utility functions for generating PDF documents using html2pdf.js
 * Supports A4 invoices and 100x150mm shipping labels.
 */
import html2pdf from "html2pdf.js";

/**
 * Download an A4 PDF invoice from a DOM element.
 * @param {HTMLElement} element - The DOM element to convert to PDF
 * @param {string} filename - The output filename (e.g. "ABL-2026-000001.pdf")
 */
export const downloadInvoicePdf = (element, filename) =>
  html2pdf()
    .set({
      margin: [10, 10, 10, 10],
      filename: filename || "invoice.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    })
    .from(element)
    .save();

/**
 * Download a 100×150mm PDF shipping label from a DOM element.
 * @param {HTMLElement} element - The DOM element to convert to PDF
 * @param {string} filename - The output filename (e.g. "label-ABL-2026-000001.pdf")
 */
export const downloadLabelPdf = (element, filename) =>
  html2pdf()
    .set({
      margin: [4, 4, 4, 4],
      filename: filename || "shipping-label.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: "mm", format: [100, 150], orientation: "portrait" },
    })
    .from(element)
    .save();

/**
 * Legacy alias kept for backwards compatibility with existing callers.
 * @deprecated Use downloadInvoicePdf or downloadLabelPdf instead.
 */
export const downloadDocumentPdf = (element, filename, format = "a4") => {
  if (Array.isArray(format)) {
    return downloadLabelPdf(element, filename);
  }
  return downloadInvoicePdf(element, filename);
};
