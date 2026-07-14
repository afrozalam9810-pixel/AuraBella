const { wrapLayout, renderButton, BASE_URL } = require("../emailComponents");

/**
 * Reusable Return Status Update Template.
 * Handles: returnRequestReceived, returnApproved, and returnRejected.
 * @param {object} context - { order, status, reason }
 */
module.exports = function returnStatusUpdate(context) {
  const { order, status } = context;
  const name = order.shippingAddress?.name || "Valued Customer";
  
  let title = `Return Request Update on Order #${order.orderId}`;
  let statusHeadline = "";
  let statusMessage = "";
  let detailsSection = "";
  let ctaButton = "";

  const trackUrl = `${BASE_URL}/account/orders`;

  switch (status) {
    case "received":
      title = `Return Request Received for Order #${order.orderId}`;
      statusHeadline = "Return Request Received";
      statusMessage = "We have received your request to return items from your order. Our returns processing team is currently auditing the request details. You will receive an email confirmation once it is approved or rejected.";
      ctaButton = renderButton("View Return Details", trackUrl);
      break;
    case "approved":
      title = `Return Request Approved for Order #${order.orderId} | Aurabella`;
      statusHeadline = "Return Approved!";
      statusMessage = "Great news! Your request to return items has been approved. We have scheduled a free reverse-pickup from your shipping address. Our courier agent will pick up the package within 24-48 hours. Please ensure items are packed securely in their original boxes with tags attached.";
      ctaButton = renderButton("View Pickup Status", trackUrl);
      break;
    case "rejected":
      title = `Return Request Declined for Order #${order.orderId}`;
      statusHeadline = "Return Request Declined";
      statusMessage = `We regret to inform you that your request to return items has been declined. Our returns audit team noted that the items did not meet our necessary return eligibility guidelines (e.g. tags missing, item used, or past 30-day window).`;
      if (context.reason) {
        detailsSection = `
          <div style="background-color:#fff1f2;border:1px solid #ffe4e6;border-radius:12px;padding:20px;margin-bottom:25px;color:#9f1239;">
            <h4 style="margin:0 0 8px 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Decline Reason</h4>
            <p style="margin:0;font-size:13px;">${context.reason}</p>
          </div>
        `;
      }
      ctaButton = renderButton("Contact Support", `${BASE_URL}/contact`);
      break;
    default:
      statusHeadline = "Return Request Status Updated";
      statusMessage = `The status of your return request for order #${order.orderId} has been updated to: ${status}.`;
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

    ${detailsSection}

    <div style="background-color:#faf8ff;border:1px solid #f0ebf8;border-radius:12px;padding:20px;margin-bottom:25px;">
      <table style="width:100%;font-size:13px;color:#4d445c;">
        <tr>
          <td style="padding:2px 0;font-weight:bold;width:120px;">Order ID:</td>
          <td style="padding:2px 0;color:#1e1830;">#${order.orderId}</td>
        </tr>
        <tr>
          <td style="padding:2px 0;font-weight:bold;">Refund Eligibility:</td>
          <td style="padding:2px 0;font-weight:bold;color:#7c3aed;">Subject to inspection pass</td>
        </tr>
      </table>
    </div>

    ${ctaButton}

    <p style="color:#4d445c;margin-top:35px;font-size:12px;line-height:1.7;">
      If you did not initiate this return request or need further clarification, please contact our support team at <a href="mailto:support@aurabellaafroz.com" style="color:#7c3aed;text-decoration:none;">support@aurabellaafroz.com</a>.
    </p>
  `;

  return wrapLayout(title, content);
};
