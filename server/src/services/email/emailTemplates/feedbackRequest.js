const { wrapLayout, renderButton, BASE_URL } = require("../emailComponents");

/**
 * Feedback Request / Review Request Email
 * Sent to the customer after their order is delivered to request reviews.
 * @param {object} context - { name, order }
 */
module.exports = function feedbackRequest(context) {
  const { name, order } = context;
  const title = `We'd love to hear your thoughts on your order #${order.orderId}!`;
  
  // Create review links for items in the order
  let itemsHtml = "";
  if (order.items && order.items.length > 0) {
    itemsHtml = `<div style="margin: 25px 0; border-top: 1px solid #f0ebf8; border-bottom: 1px solid #f0ebf8; padding: 15px 0;">`;
    order.items.forEach((item) => {
      const prodName = item.product?.name || "Product";
      const prodId = item.product?._id || item.product;
      const reviewUrl = `${BASE_URL}/products/${prodId}?tab=reviews`;
      itemsHtml += `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; font-size: 13px;">
          <span style="color: #1e1830; font-weight: 600;">${prodName}</span>
          <a href="${reviewUrl}" style="color: #7c3aed; font-weight: bold; text-decoration: none; font-size: 12px;">Write Review &rarr;</a>
        </div>
      `;
    });
    itemsHtml += `</div>`;
  }

  const content = `
    <h2 style="font-family:'Didot',Georgia,serif;color:#1e1830;font-size:22px;margin-top:0;font-weight:700;letter-spacing:1px;">
      Share Your Feedback ✨
    </h2>

    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;">
      Hi ${name || "there"},<br/>
      Thank you for shopping with <strong>AuraBella</strong>! Your order <strong>#${order.orderId}</strong> has been delivered. We hope you are loving your items!
    </p>

    <p style="color:#4d445c;font-size:14px;line-height:1.7;">
      Could you please take a quick minute to share your thoughts on the products you bought? Your feedback helps other customers make choices and helps us continuously refine our designs.
    </p>

    ${itemsHtml}

    <p style="color:#4d445c;font-size:13px;line-height:1.7;margin-bottom:20px;">
      Click the button below to view your order history or click individual review links above.
    </p>

    ${renderButton("View My Orders", `${BASE_URL}/account/orders`)}

    <p style="color:#9d8bbb;margin-top:35px;font-size:11px;line-height:1.7;border-top:1px solid #f0ebf8;padding-top:20px;text-align:center;">
      This email was sent to you because you recently completed a purchase at AuraBella.<br/>
      If you did not receive these items, please contact support immediately.
    </p>
  `;

  return wrapLayout(title, content);
};
