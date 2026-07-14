const { wrapLayout, renderButton, BASE_URL } = require("../emailComponents");

/**
 * Generate Shipping Label Alert Email (Admin Only).
 * @param {object} context - { order, courier, trackingNumber, weight, dimensions }
 */
module.exports = function shippingLabelEmail(context) {
  const { order, courier, trackingNumber } = context;
  const title = `Shipping Label Generated for Order #${order.orderId}`;
  
  const content = `
    <h2 style="font-family:'Didot',Georgia,serif;color:#1e1830;font-size:22px;margin-top:0;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Shipping Label Ready</h2>
    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;">
      Admin Notice: A new shipping label sticker has been generated for order <strong>#${order.orderId}</strong>.
    </p>

    <div style="background-color:#faf8ff;border:1px solid #f0ebf8;border-radius:12px;padding:20px;margin-bottom:25px;">
      <h3 style="margin:0 0 12px 0;font-size:13px;color:#1e1830;text-transform:uppercase;letter-spacing:1px;">Shipment Details</h3>
      <table style="width:100%;font-size:13px;color:#4d445c;">
        <tr>
          <td style="padding:4px 0;font-weight:bold;width:120px;">Order ID:</td>
          <td style="padding:4px 0;">#${order.orderId}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-weight:bold;">Courier Partner:</td>
          <td style="padding:4px 0;">${courier || "Delhivery"}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-weight:bold;">Tracking Number:</td>
          <td style="padding:4px 0;color:#7c3aed;font-weight:bold;">${trackingNumber || "Pending"}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-weight:bold;">Package Weight:</td>
          <td style="padding:4px 0;">${context.weight || "0.5"} kg</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-weight:bold;">Dimensions (cm):</td>
          <td style="padding:4px 0;">${context.dimensions || "25 x 20 x 5"} cm</td>
        </tr>
      </table>
    </div>

    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;">
      You can download, print, or view the 100mm x 150mm barcode shipping sticker via the admin order fulfillment panel:
    </p>

    ${renderButton("Print Shipping Sticker", `${BASE_URL}/admin/orders/${order._id}`)}

    <p style="color:#9d8bbb;margin-top:35px;font-size:11px;line-height:1.7;border-top:1px solid #f0ebf8;padding-top:20px;text-align:center;">
      Aurabella Logistics Dispatch System.
    </p>
  `;

  return wrapLayout(title, content);
};
