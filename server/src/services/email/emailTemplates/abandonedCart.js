const { wrapLayout, renderButton, BASE_URL } = require("../emailComponents");

/**
 * Generate Abandoned Cart Reminder Email.
 * @param {object} context - { name, cartItems }
 */
module.exports = function abandonedCart(context) {
  const name = context.name || "Valued Customer";
  const title = "Did you forget something? 🛍️ | Aurabella";
  
  let itemsHtml = "";
  context.cartItems?.forEach((item) => {
    const thumbnail = item.images?.[0] || "https://placehold.co/80x100/1e1830/f0e8ff?text=Product";
    itemsHtml += `
      <div style="display:flex;align-items:center;gap:15px;padding:15px;background-color:#ffffff;border:1px solid #f0ebf8;border-radius:12px;margin-bottom:12px;">
        <img src="${thumbnail}" alt="${item.name}" width="50" style="border-radius:6px;border:1px solid #f0ebf8;" />
        <div style="flex-grow:1;">
          <h4 style="margin:0 0 4px 0;font-size:13px;color:#1e1830;">${item.name}</h4>
          <span style="font-size:12px;font-weight:bold;color:#7c3aed;">₹${item.price.toLocaleString("en-IN")}</span>
        </div>
      </div>
    `;
  });

  const content = `
    <h2 style="font-family:'Didot',Georgia,serif;color:#1e1830;font-size:22px;margin-top:0;font-weight:700;letter-spacing:1px;text-align:center;">Your Bag is Waiting!</h2>
    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;text-align:center;">
      Hello ${name},
    </p>
    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;text-align:center;">
      We noticed that you left some premium fashion pieces in your shopping cart. Don't let your favorites slip away! Our luxury garments are produced in limited numbers to protect the uniqueness of your style.
    </p>

    <div style="margin:25px 0;">
      <h3 style="margin:0 0 12px 0;font-size:11px;color:#9d8bbb;text-transform:uppercase;letter-spacing:1px;">Items in Your Bag</h3>
      ${itemsHtml || `
      <div style="text-align:center;color:#6b5d7d;font-style:italic;font-size:13px;">
        Your favorite luxury styles are still saved and secured.
      </div>
      `}
    </div>

    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;text-align:center;">
      Click below to resume your secure checkout and complete your order:
    </p>

    ${renderButton("Return to Cart", `${BASE_URL}/cart`)}

    <p style="color:#9d8bbb;margin-top:35px;font-size:11px;line-height:1.7;text-align:center;">
      Need styling assistance or sizing advice? Reply directly to this email to speak with an in-house fashion consultant.
    </p>
  `;

  return wrapLayout(title, content);
};
