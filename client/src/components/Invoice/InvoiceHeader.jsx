/**
 * InvoiceHeader.jsx
 * Company branding header used in the printable invoice.
 * Shows AuraBella logo, contact info, GST/PAN, and invoice metadata.
 */

/**
 * @param {{ order: object }} props
 */
export default function InvoiceHeader({ order }) {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "24px",
        paddingBottom: "16px",
        borderBottom: "3px solid #d4af70",
        marginBottom: "20px",
      }}
    >
      {/* Left — Company Branding */}
      <div style={{ flex: 1 }}>
        {/* Logo wordmark */}
        <div
          style={{
            fontSize: "30px",
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: "700",
            color: "#6d287f",
            letterSpacing: "0.05em",
            lineHeight: 1,
          }}
        >
          AuraBella
        </div>
        <div
          style={{
            fontSize: "10px",
            color: "#9b59b6",
            fontStyle: "italic",
            marginTop: "2px",
            marginBottom: "10px",
          }}
        >
          Premium Fashion &amp; Luxury Beauty
        </div>

        {/* Contact row */}
        <table style={{ fontSize: "9px", color: "#555", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td style={{ paddingRight: "8px", color: "#888", width: "60px" }}>Website:</td>
              <td>aurabellaafroz.com</td>
            </tr>
            <tr>
              <td style={{ color: "#888" }}>Email:</td>
              <td>support@aurabellaafroz.com</td>
            </tr>
            <tr>
              <td style={{ color: "#888" }}>Phone:</td>
              <td>+91 98XXX XXXXX</td>
            </tr>
            <tr>
              <td style={{ color: "#888" }}>Address:</td>
              <td>AuraBella HQ, Fashion District, India</td>
            </tr>
            <tr>
              <td style={{ color: "#888" }}>GSTIN:</td>
              <td style={{ fontWeight: 700 }}>27AAAAA0000A1Z5</td>
            </tr>
            <tr>
              <td style={{ color: "#888" }}>PAN:</td>
              <td style={{ fontWeight: 700 }}>AAAAA0000A</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Right — Invoice Metadata */}
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div
          style={{
            fontSize: "18px",
            fontWeight: "900",
            color: "#6d287f",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginBottom: "10px",
          }}
        >
          TAX INVOICE
        </div>

        <table style={{ fontSize: "10px", color: "#333", borderCollapse: "collapse", marginLeft: "auto" }}>
          <tbody>
            <tr>
              <td style={{ color: "#888", paddingRight: "12px", paddingBottom: "3px" }}>Invoice No.:</td>
              <td style={{ fontWeight: 700, color: "#6d287f" }}>
                {order.invoiceNumber || "Pending"}
              </td>
            </tr>
            <tr>
              <td style={{ color: "#888", paddingBottom: "3px" }}>Invoice Date:</td>
              <td style={{ fontWeight: 600 }}>
                {new Date(order.invoiceDate || order.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </td>
            </tr>
            <tr>
              <td style={{ color: "#888", paddingBottom: "3px" }}>Order No.:</td>
              <td style={{ fontWeight: 600 }}>{order._id}</td>
            </tr>
            <tr>
              <td style={{ color: "#888", paddingBottom: "3px" }}>Order Date:</td>
              <td>
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </td>
            </tr>
            <tr>
              <td style={{ color: "#888", paddingBottom: "3px" }}>Payment:</td>
              <td style={{ fontWeight: 700, textTransform: "uppercase" }}>
                {order.paymentMethod}
              </td>
            </tr>
            <tr>
              <td style={{ color: "#888" }}>Status:</td>
              <td
                style={{
                  fontWeight: 700,
                  color:
                    order.paymentStatus === "completed"
                      ? "#1a7a3a"
                      : order.paymentStatus === "pending"
                      ? "#b8860b"
                      : "#c0392b",
                  textTransform: "uppercase",
                }}
              >
                {order.paymentStatus}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </header>
  );
}
