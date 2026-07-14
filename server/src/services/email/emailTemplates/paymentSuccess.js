const { wrapLayout, renderButton, BASE_URL } = require("../emailComponents");

/**
 * Generate Payment Success Email.
 * @param {object} context - { order, paymentId, amount }
 */
module.exports = function paymentSuccess(context) {
  const { order, paymentId, amount } = context;
  const name = order.shippingAddress?.name || "Valued Customer";
  const title = `Payment Received for Order #${order.orderId}`;
  
  const content = `
    <h2 style="font-family:'Didot',Georgia,serif;color:#1e1830;font-size:22px;margin-top:0;font-weight:700;letter-spacing:1px;">Payment Successful!</h2>
    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;">
      Hello ${name},
    </p>
    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;">
      Thank you! We have successfully received your secure online payment of <strong>₹${amount.toLocaleString("en-IN")}</strong> for your Aurabella order.
    </p>
    
    <div style="background-color:#faf8ff;border:1px solid #f0ebf8;border-radius:12px;padding:20px;margin-bottom:25px;">
      <h3 style="margin:0 0 12px 0;font-size:13px;color:#1e1830;text-transform:uppercase;letter-spacing:1px;">Transaction Details</h3>
      <table style="width:100%;font-size:13px;color:#4d445c;">
        <tr>
          <td style="padding:4px 0;font-weight:bold;width:120px;">Order ID:</td>
          <td style="padding:4px 0;color:#1e1830;">#${order.orderId}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-weight:bold;">Transaction/Razorpay ID:</td>
          <td style="padding:4px 0;color:#7c3aed;font-weight:bold;">${paymentId}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-weight:bold;">Amount Received:</td>
          <td style="padding:4px 0;font-weight:bold;">₹${amount.toLocaleString("en-IN")}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-weight:bold;">Payment Status:</td>
          <td style="padding:4px 0;color:#16a34a;font-weight:bold;">COMPLETED / CAPTURED</td>
        </tr>
      </table>
    </div>

    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;">
      Your package is now in the fulfillment queue. You will receive tracking alerts as soon as it is packed and dispatched from our warehouse.
    </p>

    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;text-align:center;">
      You can download your detailed tax invoice directly from your orders page:
    </p>
    
    ${renderButton("View Invoice Details", `${BASE_URL}/account/orders`)}

    <p style="color:#4d445c;margin-top:35px;font-size:12px;line-height:1.7;">
      If you did not authorize this transaction, please contact our support team immediately at <a href="mailto:support@aurabellaafroz.com" style="color:#7c3aed;text-decoration:none;">support@aurabellaafroz.com</a>.
    </p>
  `;

  return wrapLayout(title, content);
};
