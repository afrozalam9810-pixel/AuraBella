const { wrapLayout, renderButton, BASE_URL } = require("../emailComponents");

/**
 * Generate Payment Failed Email.
 * @param {object} context - { order, amount, error }
 */
module.exports = function paymentFailed(context) {
  const { order, amount } = context;
  const name = order.shippingAddress?.name || "Valued Customer";
  const title = `Payment Failed for Order #${order.orderId}`;
  
  const content = `
    <h2 style="font-family:'Didot',Georgia,serif;color:#e11d48;font-size:22px;margin-top:0;font-weight:700;letter-spacing:1px;">Payment Transaction Failed</h2>
    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;">
      Hello ${name},
    </p>
    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;">
      We attempted to process your secure online payment of <strong>₹${amount.toLocaleString("en-IN")}</strong> for your Aurabella order, but the transaction was declined by your bank or the card issuer.
    </p>
    
    <div style="background-color:#fff1f2;border:1px solid #ffe4e6;border-radius:12px;padding:20px;margin-bottom:25px;color:#9f1239;">
      <h3 style="margin:0 0 12px 0;font-size:13px;color:#9f1239;text-transform:uppercase;letter-spacing:1px;">Failed Order Details</h3>
      <table style="width:100%;font-size:13px;color:#9f1239;">
        <tr>
          <td style="padding:4px 0;font-weight:bold;width:120px;">Order ID:</td>
          <td style="padding:4px 0;">#${order.orderId}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-weight:bold;">Amount:</td>
          <td style="padding:4px 0;font-weight:bold;">₹${amount.toLocaleString("en-IN")}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-weight:bold;">Failure Reason:</td>
          <td style="padding:4px 0;">${context.error || "Transaction declined by payment portal."}</td>
        </tr>
      </table>
    </div>

    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;">
      <strong>Note:</strong> If the money has been deducted from your account, it is completely safe. The bank will reverse the transaction and credit the amount back to your account within 3–5 business days.
    </p>
    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;text-align:center;">
      You can retry processing the payment safely by clicking the button below:
    </p>
    
    ${renderButton("Retry Payment", `${BASE_URL}/cart`)}

    <p style="color:#4d445c;margin-top:35px;font-size:12px;line-height:1.7;">
      For payment assistance or support, please contact our helpline at <a href="mailto:support@aurabellaafroz.com" style="color:#7c3aed;text-decoration:none;">support@aurabellaafroz.com</a>.
    </p>
  `;

  return wrapLayout(title, content);
};
