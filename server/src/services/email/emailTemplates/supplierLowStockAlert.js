const { wrapLayout, renderButton, BASE_URL } = require("../emailComponents");

/**
 * Supplier Low Stock Alert Email
 * Sent to the supplier (or admin) when a product variant hits the reorder threshold.
 * @param {object} context - { productName, sku, size, color, currentStock, threshold, supplierName, adminPanelUrl }
 */
module.exports = function supplierLowStockAlert(context) {
  const {
    productName,
    sku       = "",
    size      = "All",
    color     = "All",
    currentStock,
    threshold,
    supplierName = "Supplier",
    adminPanelUrl,
  } = context;

  const title   = `[ACTION REQUIRED] Reorder Alert — ${productName}`;
  const content = `
    <h2 style="font-family:'Didot',Georgia,serif;color:#1e1830;font-size:22px;margin-top:0;font-weight:700;letter-spacing:1px;">
      Inventory Reorder Alert ⚠️
    </h2>

    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;">
      Dear <strong style="color:#1e1830;">${supplierName}</strong>,<br/>
      The following product has dropped below its minimum reorder threshold on the
      <strong>AuraBella</strong> platform. Please arrange replenishment at your earliest convenience.
    </p>

    <div style="background-color:#faf8ff;border:1px solid #f0ebf8;border-radius:12px;padding:20px;margin-bottom:25px;">
      <table style="width:100%;font-size:13px;color:#4d445c;border-collapse:collapse;">
        <tr>
          <td style="padding:6px 0;font-weight:bold;width:140px;">Product Name:</td>
          <td style="padding:6px 0;">${productName}</td>
        </tr>
        ${sku ? `<tr><td style="padding:6px 0;font-weight:bold;">SKU / Code:</td><td style="padding:6px 0;">${sku}</td></tr>` : ""}
        <tr>
          <td style="padding:6px 0;font-weight:bold;">Variant (Size):</td>
          <td style="padding:6px 0;">${size}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-weight:bold;">Variant (Color):</td>
          <td style="padding:6px 0;">${color}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-weight:bold;">Current Stock:</td>
          <td style="padding:6px 0;color:#e11d48;font-weight:bold;">${currentStock} units remaining</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-weight:bold;">Reorder Threshold:</td>
          <td style="padding:6px 0;">${threshold} units</td>
        </tr>
      </table>
    </div>

    <p style="color:#4d445c;font-size:13px;line-height:1.7;margin-bottom:20px;">
      Please confirm your replenishment timeline with the AuraBella procurement team.
      You can also view the product details in the admin panel below.
    </p>

    ${renderButton("View in Admin Panel", adminPanelUrl || `${BASE_URL}/admin`)}

    <p style="color:#9d8bbb;margin-top:35px;font-size:11px;line-height:1.7;border-top:1px solid #f0ebf8;padding-top:20px;text-align:center;">
      This is an automated inventory alert from the AuraBella platform.<br/>
      Please do not reply to this email directly.
    </p>
  `;

  return wrapLayout(title, content);
};
