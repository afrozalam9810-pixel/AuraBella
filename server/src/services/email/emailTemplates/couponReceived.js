const { wrapLayout, renderButton, BASE_URL } = require("../emailComponents");

/**
 * Generate Coupon Received Promotion Email.
 * @param {object} context - { name, couponCode, discountText, minOrderText, expiryDate }
 */
module.exports = function couponReceived(context) {
  const name = context.name || "Valued Customer";
  const title = `Exclusive Promo Coupon inside! 🎁 | Aurabella`;
  
  const content = `
    <h2 style="font-family:'Didot',Georgia,serif;color:#1e1830;font-size:22px;margin-top:0;font-weight:700;letter-spacing:1px;text-align:center;">A Special Gift For You!</h2>
    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;text-align:center;">
      Hello ${name},
    </p>
    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;text-align:center;">
      To thank you for being a valued member of the Aurabella community, we have unlocked a special promotional coupon code just for you.
    </p>

    <div style="background-color:#faf8ff;border:1px dashed #7c3aed;border-radius:16px;padding:30px;margin:30px 0;text-align:center;">
      <span style="display:inline-block;color:#7c3aed;font-size:24px;font-weight:bold;letter-spacing:2px;background-color:#ffffff;border:1px solid #7c3aed;padding:8px 24px;border-radius:8px;margin-bottom:15px;text-transform:uppercase;">
        ${context.couponCode || "SPECIAL10"}
      </span>
      <p style="color:#1e1830;font-size:18px;font-weight:bold;margin:0 0 8px 0;">${context.discountText || "Get 10% OFF Your Next Order"}</p>
      <p style="color:#6b5d7d;font-size:12px;margin:0;">${context.minOrderText || "Valid on all clothing and accessory categories"}</p>
      ${context.expiryDate ? `<p style="color:#e11d48;font-size:11px;font-weight:bold;margin-top:10px;margin-bottom:0;">Expires on: ${context.expiryDate}</p>` : ""}
    </div>

    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;text-align:center;">
      Apply this code at checkout to claim your member-exclusive savings:
    </p>

    ${renderButton("Shop Latest Trends", `${BASE_URL}`)}

    <p style="color:#9d8bbb;margin-top:35px;font-size:10px;line-height:1.7;text-align:center;">
      Terms &amp; conditions apply. Coupon cannot be combined with other offers.
    </p>
  `;

  return wrapLayout(title, content);
};
