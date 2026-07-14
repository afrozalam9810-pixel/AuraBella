const { wrapLayout, renderButton, BASE_URL } = require("../emailComponents");

/**
 * Generate Invoice Generated Email.
 * @param {object} context - { order }
 */
module.exports = function invoiceEmail(context) {
  const { order } = context;
  const name = order.shippingAddress?.name || "Valued Customer";
  const title = `Tax Invoice for Order #${order.orderId}`;
  
  const content = `
    <h2 style="font-family:'Didot',Georgia,serif;color:#1e1830;font-size:22px;margin-top:0;font-weight:700;letter-spacing:1px;">Your Tax Invoice is Ready</h2>
    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;">
      Hello ${name},
    </p>
    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;">
      Thank you for shopping at <strong>Aurabella</strong>! The official tax invoice for your purchase has been successfully generated.
    </p>

    <div style="background-color:#faf8ff;border:1px solid #f0ebf8;border-radius:12px;padding:20px;margin-bottom:25px;">
      <h3 style="margin:0 0 12px 0;font-size:13px;color:#1e1830;text-transform:uppercase;letter-spacing:1px;">Invoice Details</h3>
      <table style="width:100%;font-size:13px;color:#4d445c;">
        <tr>
          <td style="padding:4px 0;font-weight:bold;width:120px;">Order ID:</td>
          <td style="padding:4px 0;">#${order.orderId}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-weight:bold;">Invoice Number:</td>
          <td style="padding:4px 0;color:#7c3aed;font-weight:bold;">${order.invoiceNumber}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-weight:bold;">Invoice Date:</td>
          <td style="padding:4px 0;">${new Date(order.createdAt).toLocaleDateString("en-IN")}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-weight:bold;">Total Amount:</td>
          <td style="padding:4px 0;font-weight:bold;">₹${(order.finalTotal || order.totalAmount).toLocaleString("en-IN")}</td>
        </tr>
      </table>
    </div>

    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;">
      Please find the PDF copy of your tax invoice attached to this email. You can also view and download it at any time directly from your order dashboard on our website:
    </p>

    ${renderButton("Download Invoice PDF", `${BASE_URL}/admin/orders/${order._id}/invoice`)}

    <p style="color:#4d445c;margin-top:35px;font-size:12px;line-height:1.7;">
      Need any assistance or GST information updates? Reach out to support at <a href="mailto:support@aurabellaafroz.com" style="color:#7c3aed;text-decoration:none;">support@aurabellaafroz.com</a>.
    </p>
  `;

  return wrapLayout(title, content);
};
