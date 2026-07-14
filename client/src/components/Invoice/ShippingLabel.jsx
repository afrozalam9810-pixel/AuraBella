/**
 * ShippingLabel.jsx
 * Professional shipping sticker for AuraBella orders.
 * Optimized for 100mm × 150mm format — prints on sticker paper.
 *
 * Includes: Receiver address, Order ID, Tracking, Courier,
 *           COD/PREPAID badge, Package details, barcode, return address.
 *
 * Usage:
 *   <ShippingLabel order={order} />
 */

// ─── Barcode visual (ASCII art — professional look without a library) ─────────
function BarcodeVisual({ value }) {
  // Generate a deterministic-looking barcode pattern from the value string
  const seed = (value || "DEFAULT").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const bars = Array.from({ length: 52 }, (_, i) => {
    const w = ((seed * (i + 3) * 7 + i * 13) % 4) + 1;
    return { width: w, dark: (seed + i * 5) % 3 !== 0 };
  });

  return (
    <div style={{ textAlign: "center", marginTop: "10px" }}>
      {/* Barcode bars */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "stretch",
          height: "42px",
          gap: "1px",
          background: "#fff",
          padding: "4px 6px",
          border: "1px solid #ddd",
        }}
      >
        {bars.map((bar, i) => (
          <div
            key={i}
            style={{
              width: `${bar.width}px`,
              background: bar.dark ? "#111" : "#fff",
              height: "100%",
            }}
          />
        ))}
      </div>

      {/* Value text below barcode */}
      <div
        style={{
          fontSize: "7.5px",
          fontFamily: "'Courier New', monospace",
          color: "#333",
          marginTop: "3px",
          letterSpacing: "0.12em",
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ─── Address section ──────────────────────────────────────────────────────────
function AddressSection({ address, user }) {
  return (
    <div style={{ marginTop: "10px" }}>
      {/* SHIP TO label */}
      <div
        style={{
          fontSize: "7px",
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          color: "#888",
          fontWeight: 700,
          marginBottom: "2px",
        }}
      >
        SHIP TO:
      </div>

      {/* Recipient name — large */}
      <div
        style={{
          fontSize: "14px",
          fontWeight: 900,
          color: "#111",
          lineHeight: "1.2",
          marginBottom: "2px",
        }}
      >
        {address?.name || user?.name || "—"}
      </div>

      {/* Phone */}
      <div style={{ fontSize: "11px", fontWeight: 700, color: "#333", marginBottom: "5px" }}>
        📞 {address?.phone || "—"}
      </div>

      {/* Address lines */}
      {[
        address?.line1,
        address?.line2,
        address?.street,
        address?.area,
        [address?.city, address?.district].filter(Boolean).join(", "),
        [address?.state, "–", address?.pincode].filter(Boolean).join(" "),
        address?.country || "India",
      ]
        .filter(Boolean)
        .map((line, i) => (
          <div key={i} style={{ fontSize: "9.5px", color: "#333", lineHeight: "1.45" }}>
            {line}
          </div>
        ))}
    </div>
  );
}

// ─── Main Shipping Label ──────────────────────────────────────────────────────
export default function ShippingLabel({ order }) {
  const address = order?.shippingAddress || {};
  const user = order?.user || {};
  const isCod = order?.paymentMethod === "cod";
  const barcodeValue = order?.trackingNumber || order?.invoiceNumber || order?._id || "AURABELLA";

  return (
    <article
      className="shipping-label"
      style={{
        background: "#ffffff",
        color: "#111",
        width: "100mm",
        minHeight: "150mm",
        margin: "0 auto",
        padding: "5mm 5mm",
        fontFamily: "'Poppins', Inter, system-ui, sans-serif",
        fontSize: "10px",
        boxSizing: "border-box",
        border: "2px solid #6d287f",
        position: "relative",
      }}
    >
      {/* ── Header: Logo + COD/PREPAID badge ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: "2.5px solid #d4af70",
          paddingBottom: "8px",
          marginBottom: "2px",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "20px",
              fontWeight: 700,
              color: "#6d287f",
              lineHeight: 1,
            }}
          >
            AuraBella
          </div>
          <div style={{ fontSize: "7.5px", color: "#9b59b6", marginTop: "1px" }}>
            Premium Fashion &amp; Luxury Beauty
          </div>
        </div>

        {/* COD / PREPAID Badge */}
        <div
          style={{
            background: isCod ? "#fff0f0" : "#f0fff4",
            color: isCod ? "#c0392b" : "#1a7a3a",
            border: `2.5px solid ${isCod ? "#c0392b" : "#1a7a3a"}`,
            fontWeight: 900,
            padding: "4px 8px",
            fontSize: "11px",
            borderRadius: "3px",
            letterSpacing: "0.1em",
            textAlign: "center",
          }}
        >
          {isCod ? "COD" : "PREPAID"}
          <div style={{ fontSize: "7px", fontWeight: 400, letterSpacing: 0, marginTop: "1px" }}>
            {isCod ? `₹${(order?.totalAmount || 0).toLocaleString("en-IN")}` : "Paid"}
          </div>
        </div>
      </div>

      {/* ── Recipient Address ── */}
      <AddressSection address={address} user={user} />

      {/* ── Divider ── */}
      <hr style={{ border: "none", borderTop: "1px dashed #ccc", margin: "10px 0" }} />

      {/* ── Order / Shipping Details grid ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "6px",
          fontSize: "8.5px",
        }}
      >
        {[
          ["Order ID", order?._id?.slice(-12) || "—"],
          ["Invoice No.", order?.invoiceNumber || "Pending"],
          ["Courier", order?.courierPartner || "To be assigned"],
          ["Tracking No.", order?.trackingNumber || "Pending"],
          ["Weight", order?.packageWeight || "—"],
          ["Dimensions", order?.packageDimensions || "—"],
        ].map(([label, value]) => (
          <div key={label}>
            <div style={{ color: "#888", fontSize: "7.5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {label}
            </div>
            <div style={{ color: "#111", fontWeight: 600, wordBreak: "break-all", lineHeight: "1.3" }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Barcode ── */}
      <BarcodeVisual value={barcodeValue} />

      {/* ── Divider ── */}
      <hr style={{ border: "none", borderTop: "1px dashed #ccc", margin: "10px 0 6px" }} />

      {/* ── Return Address ── */}
      <div style={{ fontSize: "7.5px", color: "#666" }}>
        <strong style={{ color: "#444", display: "block", marginBottom: "2px" }}>
          RETURN ADDRESS:
        </strong>
        <div>AuraBella Returns &amp; Fulfillment Centre</div>
        <div>Fashion District, India</div>
        <div>support@aurabellaafroz.com | +91 98XXX XXXXX</div>
      </div>

      {/* ── Fragile / Handle with Care note ── */}
      <div
        style={{
          marginTop: "8px",
          textAlign: "center",
          fontSize: "8px",
          color: "#9b59b6",
          fontStyle: "italic",
          fontWeight: 600,
        }}
      >
        ✦ Handle with care · AuraBella Luxury Packaging
      </div>
    </article>
  );
}
