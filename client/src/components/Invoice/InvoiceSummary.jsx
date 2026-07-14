/**
 * InvoiceSummary.jsx
 * Price breakdown summary panel used in the printable invoice.
 * Shows Subtotal, Discounts, GST, Shipping, Grand Total, Amount Paid/Due.
 */

const money = (v) =>
  `₹${Number(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

const Row = ({ label, value, bold, color, borderTop }) => (
  <tr>
    <td
      style={{
        padding: borderTop ? "8px 10px 5px" : "4px 10px",
        color: bold ? "#211827" : "#666",
        fontWeight: bold ? 700 : 400,
        fontSize: bold ? "11px" : "10px",
        borderTop: borderTop ? "2px solid #d4af70" : "none",
      }}
    >
      {label}
    </td>
    <td
      style={{
        padding: borderTop ? "8px 10px 5px" : "4px 10px",
        textAlign: "right",
        fontWeight: bold ? 900 : 500,
        color: color || (bold ? "#6d287f" : "#333"),
        fontSize: bold ? "12px" : "10px",
        borderTop: borderTop ? "2px solid #d4af70" : "none",
      }}
    >
      {value}
    </td>
  </tr>
);

/**
 * @param {{ order: object, subtotal: number, discount: number }} props
 */
export default function InvoiceSummary({ order, subtotal, discount }) {
  const couponDiscount = order.taxBreakdown?.couponDiscount || 0;
  const shippingCharges = order.taxBreakdown?.shippingCharges || 0;
  const platformFee = order.taxBreakdown?.platformFee || 0;
  const taxTotal = order.taxBreakdown?.taxAmount || 0;
  const grandTotal = order.totalAmount || 0;
  const amountPaid = order.paymentStatus === "completed" ? grandTotal : 0;
  const amountDue = grandTotal - amountPaid;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        marginTop: "20px",
      }}
    >
      <div
        style={{
          width: "340px",
          border: "1px solid #d4af70",
          borderRadius: "6px",
          overflow: "hidden",
        }}
      >
        {/* Summary header */}
        <div
          style={{
            background: "#f3e7f8",
            padding: "8px 10px",
            fontWeight: 700,
            color: "#44214d",
            fontSize: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            borderBottom: "1px solid #d4af70",
          }}
        >
          Price Breakdown
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <Row label="Items Subtotal" value={money(subtotal)} />
            {discount > 0 && (
              <Row label="Product Discount" value={`- ${money(discount)}`} color="#1a7a3a" />
            )}
            {couponDiscount > 0 && (
              <Row label="Coupon Discount" value={`- ${money(couponDiscount)}`} color="#1a7a3a" />
            )}
            {shippingCharges > 0 ? (
              <Row label="Shipping Charges" value={money(shippingCharges)} />
            ) : (
              <Row label="Shipping Charges" value="FREE" color="#1a7a3a" />
            )}
            {platformFee > 0 && (
              <Row label="Platform Fee" value={money(platformFee)} />
            )}
            {taxTotal > 0 && (
              <Row label="GST (included)" value={money(taxTotal)} color="#555" />
            )}

            {/* Grand Total */}
            <Row label="Grand Total" value={money(grandTotal)} bold borderTop />

            {/* Amount Paid / Due */}
            <Row
              label="Amount Paid"
              value={money(amountPaid)}
              color={amountPaid > 0 ? "#1a7a3a" : "#888"}
            />
            <Row
              label="Amount Due"
              value={money(amountDue)}
              color={amountDue > 0 ? "#c0392b" : "#888"}
            />
          </tbody>
        </table>

        {/* Payment method note */}
        <div
          style={{
            padding: "6px 10px",
            background: "#faf7fc",
            borderTop: "1px solid #e8ddf0",
            fontSize: "9px",
            color: "#888",
          }}
        >
          Payment via: <strong style={{ color: "#6d287f", textTransform: "uppercase" }}>
            {order.paymentMethod}
          </strong>
          {" · "}
          Status: <strong style={{ color: order.paymentStatus === "completed" ? "#1a7a3a" : "#b8860b", textTransform: "capitalize" }}>
            {order.paymentStatus}
          </strong>
        </div>
      </div>
    </div>
  );
}
