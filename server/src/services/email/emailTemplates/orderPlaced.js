const { wrapLayout, renderButton, BASE_URL } = require("../emailComponents");

/**
 * Generate Order Confirmation Email.
 * @param {object} context - { order, finalTotal }
 */
module.exports = function orderPlaced(context) {
  const { order } = context;
  const name = order.shippingAddress?.name || "Valued Customer";
  const title = `Your Aurabella Order Confirmation #${order.orderId}`;
  
  // Build items rows
  let itemsHtml = "";
  order.items?.forEach((item) => {
    const price = item.priceAtPurchase || item.product?.price || 0;
    const thumbnail = item.product?.images?.[0] || "https://placehold.co/80x100/1e1830/f0e8ff?text=AuraBella";
    itemsHtml += `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #fcfbfe;width:60px;vertical-align:middle;">
          <img src="${thumbnail}" alt="${item.product?.name || "Item"}" width="50" style="border-radius:6px;border:1px solid #f0ebf8;display:block;" />
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #fcfbfe;vertical-align:middle;font-size:13px;color:#2e2a36;">
          <strong style="color:#1e1830;">${item.product?.name || "Product Item"}</strong><br>
          <span style="font-size:11px;color:#9d8bbb;">Size: ${item.variant?.size || "Default"} | Color: ${item.variant?.color || "Default"}</span>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #fcfbfe;vertical-align:middle;text-align:center;font-size:13px;color:#4d445c;">
          ${item.qty}
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #fcfbfe;vertical-align:middle;text-align:right;font-size:13px;font-weight:bold;color:#1e1830;">
          ₹${(price * item.qty).toLocaleString("en-IN")}
        </td>
      </tr>
    `;
  });

  const content = `
    <h2 style="font-family:'Didot',Georgia,serif;color:#1e1830;font-size:22px;margin-top:0;font-weight:700;letter-spacing:1px;">Thank You For Your Purchase!</h2>
    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;">
      Hello ${name},
    </p>
    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;">
      Your order has been placed successfully at <strong>Aurabella</strong>! We are currently packing your luxury package and preparing it for delivery.
    </p>
    
    <!-- Order info box -->
    <div style="background-color:#faf8ff;border:1px solid #f0ebf8;border-radius:12px;padding:20px;margin-bottom:25px;">
      <table style="width:100%;font-size:13px;color:#4d445c;">
        <tr>
          <td style="padding:4px 0;font-weight:bold;width:120px;">Order ID:</td>
          <td style="padding:4px 0;color:#7c3aed;font-weight:bold;">#${order.orderId}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-weight:bold;">Invoice Number:</td>
          <td style="padding:4px 0;">${order.invoiceNumber || "Pending"}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-weight:bold;">Payment Method:</td>
          <td style="padding:4px 0;text-transform:uppercase;">${order.paymentMethod}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-weight:bold;">Payment Status:</td>
          <td style="padding:4px 0;text-transform:capitalize;">${order.paymentStatus}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-weight:bold;">Estimated Delivery:</td>
          <td style="padding:4px 0;color:#16a34a;font-weight:bold;">${context.estimatedDelivery || "3-5 Business Days"}</td>
        </tr>
      </table>
    </div>

    <!-- Items table -->
    <h3 style="margin:20px 0 10px 0;font-size:14px;color:#1e1830;text-transform:uppercase;letter-spacing:1px;font-family:'Didot',Georgia,serif;border-bottom:1px solid #f0ebf8;padding-bottom:8px;">Order Summary</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:25px;">
      <thead>
        <tr>
          <th colspan="2" style="text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#9d8bbb;padding-bottom:10px;border-bottom:1px solid #f0ebf8;">Product Details</th>
          <th style="text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#9d8bbb;padding-bottom:10px;border-bottom:1px solid #f0ebf8;width:60px;">Qty</th>
          <th style="text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#9d8bbb;padding-bottom:10px;border-bottom:1px solid #f0ebf8;width:100px;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <!-- Totals & Address -->
    <table style="width:100%;font-size:13px;color:#4d445c;margin-bottom:25px;">
      <tr>
        <td style="width:50%;vertical-align:top;padding-right:20px;">
          <strong style="color:#1e1830;display:block;margin-bottom:6px;text-transform:uppercase;font-size:11px;letter-spacing:1px;">Delivery Address</strong>
          <span style="line-height:1.5;font-size:12px;color:#6b5d7d;">
            ${order.shippingAddress?.name}<br>
            Phone: ${order.shippingAddress?.phone}<br>
            ${order.shippingAddress?.line1}, ${order.shippingAddress?.line2 || ""}<br>
            ${order.shippingAddress?.city}, ${order.shippingAddress?.state} — ${order.shippingAddress?.pincode}<br>
            ${order.shippingAddress?.country || "India"}
          </span>
        </td>
        <td style="width:50%;vertical-align:top;text-align:right;">
          <table style="width:100%;font-size:13px;color:#4d445c;">
            <tr>
              <td style="padding:4px 0;color:#9d8bbb;">Subtotal:</td>
              <td style="padding:4px 0;font-weight:bold;text-align:right;">₹${order.totalAmount.toLocaleString("en-IN")}</td>
            </tr>
            ${order.coupon?.discountAmount ? `
            <tr>
              <td style="padding:4px 0;color:#16a34a;">Coupon Discount:</td>
              <td style="padding:4px 0;font-weight:bold;text-align:right;color:#16a34a;">- ₹${order.coupon.discountAmount.toLocaleString("en-IN")}</td>
            </tr>
            ` : ""}
            <tr>
              <td style="padding:4px 0;color:#9d8bbb;">Estimated Shipping:</td>
              <td style="padding:4px 0;color:#16a34a;font-weight:bold;text-align:right;">Free</td>
            </tr>
            <tr>
              <td style="padding:10px 0 0 0;font-weight:bold;color:#1e1830;font-size:15px;border-top:1px solid #f0ebf8;">Grand Total:</td>
              <td style="padding:10px 0 0 0;font-weight:bold;color:#7c3aed;font-size:16px;text-align:right;border-top:1px solid #f0ebf8;">
                ₹${(order.finalTotal || order.totalAmount).toLocaleString("en-IN")}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;text-align:center;">
      You can track your package details and download your tax invoices on your account page:
    </p>

    ${renderButton("Track Your Order", `${BASE_URL}/account/orders`)}

    <p style="color:#4d445c;margin-top:35px;font-size:12px;line-height:1.7;">
      If you have any questions, please contact customer support immediately at <a href="mailto:support@aurabellaafroz.com" style="color:#7c3aed;text-decoration:none;">support@aurabellaafroz.com</a>.
    </p>
  `;

  return wrapLayout(title, content);
};
