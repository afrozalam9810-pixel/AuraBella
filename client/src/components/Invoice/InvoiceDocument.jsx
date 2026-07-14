/**
 * InvoiceDocument.jsx
 * Full professional A4 printable tax invoice for AuraBella orders.
 * Renders on white background with gold/purple brand accents.
 * Designed to match Flipkart / Myntra / Amazon invoice quality.
 *
 * Usage:
 *   <InvoiceDocument order={order} />
 *
 * The parent should wrap this in a ref for PDF/print capture.
 */

import InvoiceHeader from "./InvoiceHeader";
import InvoiceTable from "./InvoiceTable";
import InvoiceSummary from "./InvoiceSummary";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Build a clean array of address lines, filtering empty values. */
const addressLines = (address, user) =>
  [
    address?.name || user?.name,
    address?.phone && `📞 ${address.phone}`,
    address?.line1,
    address?.line2,
    address?.street,
    address?.area,
    [address?.city, address?.district].filter(Boolean).join(", "),
    [address?.state, address?.pincode].filter(Boolean).join(" – "),
    address?.country || "India",
  ].filter(Boolean);

// ─── Address Block ────────────────────────────────────────────────────────────
function AddressBlock({ title, lines, email }) {
  return (
    <div style={{ flex: 1 }}>
      <div
        style={{
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "#6d287f",
          fontSize: "9px",
          marginBottom: "6px",
          borderBottom: "1px solid #d4af70",
          paddingBottom: "3px",
        }}
      >
        {title}
      </div>
      {lines.map((line, i) => (
        <div key={i} style={{ fontSize: "10px", color: i === 0 ? "#211827" : "#555", fontWeight: i === 0 ? 700 : 400, lineHeight: "1.55" }}>
          {line}
        </div>
      ))}
      {email && (
        <div style={{ fontSize: "10px", color: "#555", marginTop: "2px" }}>{email}</div>
      )}
    </div>
  );
}

// ─── Main Invoice Document ────────────────────────────────────────────────────
export default function InvoiceDocument({ order }) {
  const items = order?.items || [];

  // Compute totals
  const subtotal = items.reduce(
    (sum, item) => sum + (item.priceAtPurchase || 0) * item.qty,
    0
  );
  const discount = Math.max(
    0,
    subtotal
      - (order.totalAmount || 0)
      - (order.taxBreakdown?.shippingCharges || 0)
      - (order.taxBreakdown?.platformFee || 0)
      + (order.taxBreakdown?.couponDiscount || 0)
  );

  const shippingLines = addressLines(order.shippingAddress, order.user);

  return (
    <article
      className="invoice-document"
      style={{
        background: "#ffffff",
        color: "#211827",
        maxWidth: "210mm",
        minHeight: "297mm",
        margin: "0 auto",
        padding: "20mm 16mm",
        fontFamily: "'Poppins', Inter, system-ui, sans-serif",
        fontSize: "10px",
        lineHeight: "1.6",
        boxSizing: "border-box",
        boxShadow: "0 4px 40px rgba(0,0,0,0.18)",
      }}
    >
      {/* ── 1. Company Header ── */}
      <InvoiceHeader order={order} />

      {/* ── 2. Addresses — Bill To / Ship To ── */}
      <section
        style={{
          display: "flex",
          gap: "32px",
          padding: "14px 0",
          borderBottom: "1px solid #e8ddf0",
          marginBottom: "4px",
        }}
      >
        <AddressBlock
          title="Bill To"
          lines={shippingLines}
          email={order.user?.email}
        />
        <AddressBlock
          title="Ship To"
          lines={shippingLines}
        />

        {/* Order info mini-column */}
        <div style={{ flexShrink: 0, minWidth: "150px" }}>
          <div
            style={{
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#6d287f",
              fontSize: "9px",
              marginBottom: "6px",
              borderBottom: "1px solid #d4af70",
              paddingBottom: "3px",
            }}
          >
            Delivery Info
          </div>
          <table style={{ fontSize: "9px", borderCollapse: "collapse", width: "100%" }}>
            <tbody>
              {order.orderStatus && (
                <tr>
                  <td style={{ color: "#888", paddingRight: "8px", paddingBottom: "2px" }}>Status:</td>
                  <td style={{ fontWeight: 700, textTransform: "capitalize", color: "#211827" }}>
                    {order.orderStatus?.replace(/_/g, " ")}
                  </td>
                </tr>
              )}
              {order.courierPartner && (
                <tr>
                  <td style={{ color: "#888", paddingBottom: "2px" }}>Courier:</td>
                  <td style={{ fontWeight: 600 }}>{order.courierPartner}</td>
                </tr>
              )}
              {order.trackingNumber && (
                <tr>
                  <td style={{ color: "#888", paddingBottom: "2px" }}>Tracking:</td>
                  <td style={{ fontWeight: 600, wordBreak: "break-all" }}>{order.trackingNumber}</td>
                </tr>
              )}
              {order.estimatedDeliveryDate && (
                <tr>
                  <td style={{ color: "#888", paddingBottom: "2px" }}>Est. Delivery:</td>
                  <td>
                    {new Date(order.estimatedDeliveryDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 3. Itemized Product Table ── */}
      <InvoiceTable items={items} />

      {/* ── 4. Price Summary ── */}
      <InvoiceSummary order={order} subtotal={subtotal} discount={discount} />

      {/* ── 5. GST / Tax Note ── */}
      {order.taxBreakdown?.gstRate > 0 && (
        <div
          style={{
            marginTop: "12px",
            padding: "8px 12px",
            background: "#faf7fc",
            border: "1px solid #e8ddf0",
            borderRadius: "4px",
            fontSize: "9px",
            color: "#666",
          }}
        >
          <strong>GST Note:</strong> All prices are inclusive of GST @{order.taxBreakdown.gstRate}%.
          Total GST collected: ₹{Number(order.taxBreakdown.taxAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}.
          This is a valid tax invoice.
        </div>
      )}

      {/* ── 6. Footer — Signature + T&C ── */}
      <footer
        style={{
          marginTop: "28px",
          paddingTop: "14px",
          borderTop: "2px solid #d4af70",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: "24px",
        }}
      >
        {/* Terms & Conditions */}
        <div style={{ flex: 1, fontSize: "8.5px", color: "#888", lineHeight: "1.5" }}>
          <strong style={{ color: "#555", display: "block", marginBottom: "4px" }}>
            Terms &amp; Conditions
          </strong>
          <p>1. Goods once sold are non-refundable unless defective or as per AuraBella's return policy (30 days).</p>
          <p>2. Warranty/guarantee as applicable to each product.</p>
          <p>3. Disputes subject to jurisdiction of courts in India.</p>
          <p>4. This is a computer-generated invoice and does not require a physical signature.</p>
          <p style={{ marginTop: "6px", fontStyle: "italic", color: "#9b59b6", fontWeight: 600 }}>
            ✦ Thank you for shopping with AuraBella. We hope you love your purchase!
          </p>
        </div>

        {/* Authorized Signature */}
        <div
          style={{
            textAlign: "center",
            minWidth: "140px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              height: "44px",
              borderBottom: "2px solid #211827",
              marginBottom: "6px",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              paddingBottom: "4px",
            }}
          >
            {/* Stylized signature placeholder */}
            <span
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "22px",
                color: "#6d287f",
                fontStyle: "italic",
                letterSpacing: "0.06em",
              }}
            >
              AuraBella
            </span>
          </div>
          <div style={{ fontSize: "9px", color: "#666", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Authorized Signatory
          </div>
          <div style={{ fontSize: "8px", color: "#999", marginTop: "2px" }}>
            For AuraBella Fashion Pvt. Ltd.
          </div>
        </div>
      </footer>
    </article>
  );
}
