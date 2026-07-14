const { wrapLayout, renderButton, BASE_URL } = require("../emailComponents");

/**
 * Generate Password Reset Request Email.
 * @param {object} context - { name, resetLink, expires }
 */
module.exports = function passwordReset(context) {
  const name = context.name || "Valued Customer";
  const title = "Reset Your Aurabella Password";
  const link = context.resetLink || `${BASE_URL}/login`;
  
  const content = `
    <h2 style="font-family:'Didot',Georgia,serif;color:#1e1830;font-size:22px;margin-top:0;font-weight:700;letter-spacing:1px;">Password Reset Request</h2>
    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;">
      Hello ${name},
    </p>
    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;">
      We received a request to reset your password for your Aurabella account. You can complete the request by clicking the button below:
    </p>
    
    ${renderButton("Reset Your Password", link)}

    <div style="background-color:#faf8ff;border:1px solid #f0ebf8;border-radius:12px;padding:20px;margin-bottom:25px;text-align:center;">
      <p style="color:#4d445c;margin:0;font-size:12px;">This password reset link will expire in <strong style="color:#e11d48;">${context.expires || "1 hour"}</strong>.</p>
    </div>

    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;">
      If you did not make this request, please ignore this email. Your current password remains completely secure.
    </p>

    <p style="color:#4d445c;margin-top:35px;font-size:12px;line-height:1.7;border-t:1px solid #f0ebf8;padding-top:20px;">
      If you need immediate help, contact support at <a href="mailto:support@aurabellaafroz.com" style="color:#7c3aed;text-decoration:none;">support@aurabellaafroz.com</a>.
    </p>
  `;

  return wrapLayout(title, content);
};
