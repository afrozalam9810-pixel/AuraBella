const { wrapLayout, renderButton, BASE_URL } = require("../emailComponents");

/**
 * Reusable Refund Status Update Template.
 * Handles: refundInitiated and refundCompleted.
 * @param {object} context - { order, status, amount, paymentMethod }
 */
module.exports = function refundStatusUpdate(context) {
  const { order, status, amount } = context;
  const name = order.shippingAddress?.name || "Valued Customer";
  
  let title = `Refund Update on Order #${order.orderId}`;
  let statusHeadline = "";
  let statusMessage = "";
  let refundMethodDetails = "";
  let ctaButton = "";

  const trackUrl = `${BASE_URL}/account/orders`;

  switch (status) {
    case "initiated":
      title = `Refund of ₹${amount.toLocaleString("en-IN")} Initiated | Aurabella`;
      statusHeadline = "Refund Initiated";
      statusMessage = `We have successfully initiated your refund of <strong>₹${amount.toLocaleString("en-IN")}</strong> for your Aurabella order. The funds have been dispatched from our accounts, and your banking gateway is currently processing the deposit.`;
      refundMethodDetails = order.paymentMethod === "cod" 
        ? "The refund will be sent to the bank credentials you provided during your return request submission."
        : "The refund will be sent back directly to your original online payment source (Card/UPI/Netbanking via Razorpay).";
      ctaButton = renderButton("View Order History", trackUrl);
      break;
    case "completed":
      title = `Refund of ₹${amount.toLocaleString("en-IN")} Processed successfully | Aurabella`;
      statusHeadline = "Refund Processed Successfully!";
      statusMessage = `Good news! Your refund of <strong>₹${amount.toLocaleString("en-IN")}</strong> has been processed successfully. The funds have been successfully settled and deposited into your account.`;
      refundMethodDetails = "Please check your bank statement or credit card statement for confirmation.";
      ctaButton = renderButton("Shop New Styles", `${BASE_URL}`);
      break;
    default:
      statusHeadline = "Refund Status Updated";
      statusMessage = `The refund status of your order #${order.orderId} has been updated to: ${status}.`;
      ctaButton = renderButton("View Order Details", trackUrl);
  }

  const content = `
    <h2 style="font-family:'Didot',Georgia,serif;color:#1e1830;font-size:22px;margin-top:0;font-weight:700;letter-spacing:1px;">${statusHeadline}</h2>
    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;">
      Hello ${name},
    </p>
    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;">
      ${statusMessage}
    </p>

    <div style="background-color:#faf8ff;border:1px solid #f0ebf8;border-radius:12px;padding:20px;margin-bottom:25px;">
      <h3 style="margin:0 0 12px 0;font-size:13px;color:#1e1830;text-transform:uppercase;letter-spacing:1px;">Refund details</h3>
      <table style="width:100%;font-size:13px;color:#4d445c;">
        <tr>
          <td style="padding:4px 0;font-weight:bold;width:120px;">Order ID:</td>
          <td style="padding:4px 0;color:#1e1830;">#${order.orderId}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-weight:bold;">Refund Amount:</td>
          <td style="padding:4px 0;font-weight:bold;color:#7c3aed;">₹${amount.toLocaleString("en-IN")}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-weight:bold;">Refund Route:</td>
          <td style="padding:4px 0;">${refundMethodDetails}</td>
        </tr>
      </table>
    </div>

    ${ctaButton}

    <p style="color:#4d445c;margin-top:35px;font-size:12px;line-height:1.7;">
      If you did not authorize this return or need further clarification, please contact our support team at <a href="mailto:support@aurabellaafroz.com" style="color:#7c3aed;text-decoration:none;">support@aurabellaafroz.com</a>.
    </p>
  `;

  return wrapLayout(title, content);
};
