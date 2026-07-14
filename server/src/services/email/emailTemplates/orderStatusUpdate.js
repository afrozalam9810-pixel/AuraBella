const { wrapLayout, renderButton, BASE_URL } = require("../emailComponents");

/**
 * Reusable Order Status Update Template.
 * Handles: Confirmed, Packed, Shipped, Out for delivery, Delivered, and Cancelled.
 * @param {object} context - { order, status, courier, trackingNumber }
 */
module.exports = function orderStatusUpdate(context) {
  const { order, status } = context;
  const name = order.shippingAddress?.name || "Valued Customer";
  
  let title = `Update on Order #${order.orderId}`;
  let statusHeadline = "";
  let statusMessage = "";
  let trackingSection = "";
  let ctaButton = "";

  const trackUrl = `${BASE_URL}/account/orders`;

  switch (status) {
    case "confirmed":
      title = `Order #${order.orderId} Confirmed | Aurabella`;
      statusHeadline = "Your Order is Confirmed!";
      statusMessage = "We have confirmed your order and started building your custom styling package. We will alert you when it is packed and ready for shipment.";
      ctaButton = renderButton("View Order Details", trackUrl);
      break;
    case "packed":
      title = `Order #${order.orderId} Packed & Ready | Aurabella`;
      statusHeadline = "Packed & Quality Verified!";
      statusMessage = "Good news! Your luxury package has successfully passed our rigorous pre-shipment quality checks, has been packed securely, and is currently waiting for pickup by our courier partners.";
      ctaButton = renderButton("View Shipment Progress", trackUrl);
      break;
    case "shipped":
      title = `Order #${order.orderId} Dispatched! 🚚 | Aurabella`;
      statusHeadline = "Your Order is on the Way!";
      statusMessage = `We have shipped your order via our courier partner. It is currently in transit and is estimated to arrive shortly.`;
      if (context.trackingNumber) {
        trackingSection = `
          <div style="background-color:#faf8ff;border:1px solid #f0ebf8;border-radius:12px;padding:20px;margin-bottom:25px;">
            <h4 style="margin:0 0 8px 0;font-size:12px;color:#1e1830;text-transform:uppercase;letter-spacing:1px;">Tracking details</h4>
            <p style="margin:0 0 6px 0;font-size:13px;color:#4d445c;"><strong>Courier Partner:</strong> ${context.courier || "Express Logistics"}</p>
            <p style="margin:0;font-size:13px;color:#4d445c;"><strong>Tracking Number:</strong> <code style="color:#7c3aed;font-weight:bold;">${context.trackingNumber}</code></p>
          </div>
        `;
      }
      ctaButton = renderButton("Track Shipment", trackUrl);
      break;
    case "out_for_delivery":
      title = `Order #${order.orderId} Out for Delivery Today! 📦 | Aurabella`;
      statusHeadline = "Arriving Today!";
      statusMessage = `Your Aurabella order is out for delivery today. Our logistics agent will reach out to you via call or SMS when they are near your location. Please ensure someone is available at the shipping address to receive the package.`;
      ctaButton = renderButton("Track Delivery Status", trackUrl);
      break;
    case "delivered":
      title = `Order #${order.orderId} Delivered successfully! 🎉 | Aurabella`;
      statusHeadline = "Enjoy Your New Styles!";
      statusMessage = `Your Aurabella order has been successfully delivered! We hope you love your new premium clothing items and accessories. Thank you for shopping with us!`;
      ctaButton = renderButton("Rate & Review Products", `${BASE_URL}/account/orders`);
      break;
    case "cancelled":
      title = `Order #${order.orderId} Cancelled | Aurabella`;
      statusHeadline = "Order Cancelled";
      statusMessage = "We confirm that your order has been successfully cancelled. If you already processed a payment for this order, we have initiated a refund, and the money will be credited back to your bank within 3–5 business days.";
      ctaButton = renderButton("Shop New Arrivals", `${BASE_URL}`);
      break;
    default:
      statusHeadline = "Order Status Updated";
      statusMessage = `The status of your order #${order.orderId} has been updated to: ${status}.`;
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

    ${trackingSection}

    <div style="background-color:#faf8ff;border:1px solid #f0ebf8;border-radius:12px;padding:20px;margin-bottom:25px;">
      <table style="width:100%;font-size:13px;color:#4d445c;">
        <tr>
          <td style="padding:2px 0;font-weight:bold;width:120px;">Order ID:</td>
          <td style="padding:2px 0;color:#1e1830;">#${order.orderId}</td>
        </tr>
        <tr>
          <td style="padding:2px 0;font-weight:bold;">Final Amount:</td>
          <td style="padding:2px 0;font-weight:bold;color:#7c3aed;">₹${(order.finalTotal || order.totalAmount).toLocaleString("en-IN")}</td>
        </tr>
        <tr>
          <td style="padding:2px 0;font-weight:bold;">Fulfillment Status:</td>
          <td style="padding:2px 0;text-transform:uppercase;color:#16a34a;font-weight:bold;">${status.replace(/_/g, " ")}</td>
        </tr>
      </table>
    </div>

    ${ctaButton}

    <p style="color:#4d445c;margin-top:35px;font-size:12px;line-height:1.7;">
      If you did not authorize this order status change or need assistance, please contact support at <a href="mailto:support@aurabellaafroz.com" style="color:#7c3aed;text-decoration:none;">support@aurabellaafroz.com</a>.
    </p>
  `;

  return wrapLayout(title, content);
};
