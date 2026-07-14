const { wrapLayout, renderButton, BASE_URL } = require("../emailComponents");

/**
 * Reusable Newsletter & Marketing Template.
 * Handles: Newsletter Subscription, Festival Sale, Special Offer, and New Arrivals.
 * @param {object} context - { title, headline, body, ctaText, ctaUrl, unsubscribeUrl }
 */
module.exports = function newsletter(context) {
  const title = context.title || "Aurabella Updates";
  const headline = context.headline || "Latest from Aurabella";
  const body = context.body || "Discover the latest trends, sales, and premium women's apparel collections at Aurabella.";
  const ctaText = context.ctaText || "Explore Collections";
  const ctaUrl = context.ctaUrl || `${BASE_URL}`;
  
  const content = `
    <h2 style="font-family:'Didot',Georgia,serif;color:#1e1830;font-size:24px;margin-top:0;font-weight:700;letter-spacing:1px;text-align:center;">${headline}</h2>
    
    <div style="color:#4d445c;margin-bottom:30px;font-size:14px;line-height:1.8;text-align:center;">
      ${body}
    </div>

    ${renderButton(ctaText, ctaUrl)}

    <div style="background-color:#faf8ff;border:1px solid #f0ebf8;border-radius:12px;padding:20px;margin-top:30px;text-align:center;font-size:12px;color:#6b5d7d;">
      <p style="margin:0 0 5px 0;font-weight:bold;color:#1e1830;">✦ Exclusive Member Privileges</p>
      <p style="margin:0;">You are receiving this email because you subscribed to receive updates from Aurabella. Thank you for supporting conscious luxury design!</p>
    </div>

    ${context.unsubscribeUrl ? `
    <p style="text-align:center;margin-top:20px;font-size:10px;color:#9d8bbb;">
      If you wish to stop receiving marketing newsletters, you can <a href="${context.unsubscribeUrl}" style="color:#7c3aed;text-decoration:underline;">unsubscribe at any time</a>.
    </p>
    ` : ""}
  `;

  return wrapLayout(title, content);
};
