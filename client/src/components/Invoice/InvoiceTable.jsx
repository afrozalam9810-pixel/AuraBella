/**
 * InvoiceTable.jsx
 * Itemized product table used inside the printable invoice.
 * Displays all order items with full product details, pricing, GST breakdown.
 */

const money = (v) =>
  `₹${Number(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

/**
 * @param {{ items: Array }} props
 */
export default function InvoiceTable({ items = [] }) {
  return (
    <div style={{ overflowX: "auto", marginTop: "16px" }}>
      <table
        className="invoice-table"
        style={{ width: "100%", borderCollapse: "collapse", fontSize: "9.5px" }}
      >
        <thead>
          <tr style={{ background: "#f3e7f8" }}>
            <th style={{ padding: "8px 6px", textAlign: "left", color: "#44214d", borderBottom: "2px solid #d4af70", width: "32px" }}>
              #
            </th>
            <th style={{ padding: "8px 6px", textAlign: "left", color: "#44214d", borderBottom: "2px solid #d4af70", minWidth: "130px" }}>
              Product
            </th>
            <th style={{ padding: "8px 6px", textAlign: "left", color: "#44214d", borderBottom: "2px solid #d4af70" }}>
              SKU / HSN
            </th>
            <th style={{ padding: "8px 6px", textAlign: "center", color: "#44214d", borderBottom: "2px solid #d4af70" }}>
              Size
            </th>
            <th style={{ padding: "8px 6px", textAlign: "center", color: "#44214d", borderBottom: "2px solid #d4af70" }}>
              Color
            </th>
            <th style={{ padding: "8px 6px", textAlign: "center", color: "#44214d", borderBottom: "2px solid #d4af70" }}>
              Qty
            </th>
            <th style={{ padding: "8px 6px", textAlign: "right", color: "#44214d", borderBottom: "2px solid #d4af70" }}>
              MRP
            </th>
            <th style={{ padding: "8px 6px", textAlign: "right", color: "#44214d", borderBottom: "2px solid #d4af70" }}>
              Selling Price
            </th>
            <th style={{ padding: "8px 6px", textAlign: "right", color: "#44214d", borderBottom: "2px solid #d4af70" }}>
              Discount
            </th>
            <th style={{ padding: "8px 6px", textAlign: "center", color: "#44214d", borderBottom: "2px solid #d4af70" }}>
              GST%
            </th>
            <th style={{ padding: "8px 6px", textAlign: "right", color: "#44214d", borderBottom: "2px solid #d4af70" }}>
              Tax Amt
            </th>
            <th style={{ padding: "8px 6px", textAlign: "right", color: "#44214d", borderBottom: "2px solid #d4af70" }}>
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => {
            const product = item.product || {};
            const mrp = product.price || item.priceAtPurchase || 0;
            const sellingPrice = item.priceAtPurchase || 0;
            const discount = Math.max(0, mrp - sellingPrice);
            const gstRate = item.gstRate ?? product.gstRate ?? 0;
            const lineTotal = sellingPrice * item.qty;
            // Tax is calculated as: (lineTotal * gstRate) / (100 + gstRate) — tax-inclusive
            const taxAmount = Number(((lineTotal * gstRate) / (100 + gstRate)).toFixed(2));
            const isEven = idx % 2 === 0;

            return (
              <tr
                key={item._id || idx}
                style={{ background: isEven ? "#ffffff" : "#faf7fc" }}
              >
                {/* # */}
                <td style={{ padding: "7px 6px", borderBottom: "1px solid #e8ddf0", color: "#888" }}>
                  {idx + 1}
                </td>

                {/* Product name + brand */}
                <td style={{ padding: "7px 6px", borderBottom: "1px solid #e8ddf0" }}>
                  <div style={{ fontWeight: 700, color: "#211827" }}>
                    {product.name || "Product Item"}
                  </div>
                  <div style={{ color: "#888", fontSize: "8.5px", marginTop: "2px" }}>
                    {product.brand || "AuraBella"}
                  </div>
                </td>

                {/* SKU / HSN */}
                <td style={{ padding: "7px 6px", borderBottom: "1px solid #e8ddf0", color: "#555" }}>
                  <div>{product.productId || "—"}</div>
                  <div style={{ color: "#999", fontSize: "8px" }}>
                    HSN: {item.hsnCode || product.hsnCode || "—"}
                  </div>
                </td>

                {/* Size */}
                <td style={{ padding: "7px 6px", borderBottom: "1px solid #e8ddf0", textAlign: "center", color: "#555" }}>
                  {item.variant?.size || "—"}
                </td>

                {/* Color */}
                <td style={{ padding: "7px 6px", borderBottom: "1px solid #e8ddf0", textAlign: "center", color: "#555" }}>
                  {item.variant?.color || "—"}
                </td>

                {/* Qty */}
                <td style={{ padding: "7px 6px", borderBottom: "1px solid #e8ddf0", textAlign: "center", fontWeight: 700, color: "#211827" }}>
                  {item.qty}
                </td>

                {/* MRP */}
                <td style={{ padding: "7px 6px", borderBottom: "1px solid #e8ddf0", textAlign: "right", color: "#888", textDecoration: discount > 0 ? "line-through" : "none" }}>
                  {money(mrp)}
                </td>

                {/* Selling Price */}
                <td style={{ padding: "7px 6px", borderBottom: "1px solid #e8ddf0", textAlign: "right", color: "#211827", fontWeight: 600 }}>
                  {money(sellingPrice)}
                </td>

                {/* Discount */}
                <td style={{ padding: "7px 6px", borderBottom: "1px solid #e8ddf0", textAlign: "right", color: discount > 0 ? "#1a7a3a" : "#888" }}>
                  {discount > 0 ? `- ${money(discount)}` : "—"}
                </td>

                {/* GST% */}
                <td style={{ padding: "7px 6px", borderBottom: "1px solid #e8ddf0", textAlign: "center", color: "#555" }}>
                  {gstRate}%
                </td>

                {/* Tax Amount */}
                <td style={{ padding: "7px 6px", borderBottom: "1px solid #e8ddf0", textAlign: "right", color: "#555" }}>
                  {money(taxAmount)}
                </td>

                {/* Line Total */}
                <td style={{ padding: "7px 6px", borderBottom: "1px solid #e8ddf0", textAlign: "right", fontWeight: 700, color: "#211827" }}>
                  {money(lineTotal)}
                </td>
              </tr>
            );
          })}
        </tbody>

        {/* Subtotal footer row */}
        <tfoot>
          <tr style={{ background: "#f3e7f8" }}>
            <td
              colSpan={11}
              style={{ padding: "8px 6px", fontWeight: 700, color: "#44214d", textAlign: "right", borderTop: "2px solid #d4af70", fontSize: "10px" }}
            >
              Items Subtotal
            </td>
            <td
              style={{ padding: "8px 6px", fontWeight: 900, color: "#6d287f", textAlign: "right", borderTop: "2px solid #d4af70", fontSize: "10px" }}
            >
              {money(items.reduce((sum, item) => sum + (item.priceAtPurchase || 0) * item.qty, 0))}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
