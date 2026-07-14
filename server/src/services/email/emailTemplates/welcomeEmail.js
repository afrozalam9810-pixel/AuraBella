const { wrapLayout, renderButton, BASE_URL } = require("../emailComponents");

/**
 * Generate Welcome Email HTML.
 * @param {object} context - { name }
 */
module.exports = function welcomeEmail(context) {
  const name = context.name || "Valued Customer";
  const title = "Welcome to Aurabella ❤️";
  
  const content = `
    <h2 style="font-family:'Didot',Georgia,serif;color:#1e1830;font-size:22px;margin-top:0;font-weight:700;letter-spacing:1px;">Welcome to the Aura Club, ${name}!</h2>
    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;">
      We are thrilled to welcome you to <strong>Aurabella</strong> — your premier online fashion destination for conscious luxury, custom-fit ethnic wear, contemporary silhouettes, and fine accessories.
    </p>
    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;">
      Your account has been created successfully. As a member of our exclusive Aura Club, you now have access to tracking your shipments, saving items to your wishlist, and receiving early alerts for our seasonal fashion sales.
    </p>
    
    <div style="background-color:#faf8ff;border:1px solid #f0ebf8;border-radius:12px;padding:20px;margin-bottom:25px;text-align:center;">
      <p style="color:#7c3aed;font-weight:bold;margin:0 0 10px 0;font-size:15px;">Enjoy 10% Off Your First Purchase!</p>
      <p style="color:#4d445c;margin:0;font-size:12px;">Use coupon code <strong style="color:#1e1830;font-size:14px;letter-spacing:1px;background-color:#ffffff;border:1px dashed #7c3aed;padding:4px 10px;border-radius:4px;">WELCOME10</strong> at checkout.</p>
    </div>

    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;text-align:center;">
      Explore our collections today and align your style with your inner essence:
    </p>
    
    ${renderButton("Discover Collections", `${BASE_URL}`)}

    <p style="color:#4d445c;margin-top:30px;font-size:12px;line-height:1.7;border-t:1px solid #f0ebf8;padding-top:20px;">
      If you did not create this account, please ignore this email or contact our support team at <a href="mailto:support@aurabellaafroz.com" style="color:#7c3aed;text-decoration:none;">support@aurabellaafroz.com</a>.
    </p>
  `;

  return wrapLayout(title, content);
};
