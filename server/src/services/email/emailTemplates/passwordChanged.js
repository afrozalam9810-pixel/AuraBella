const { wrapLayout, renderButton, BASE_URL } = require("../emailComponents");

/**
 * Generate Password Changed Confirmation Email.
 * @param {object} context - { name, date, time }
 */
module.exports = function passwordChanged(context) {
  const name = context.name || "Valued Customer";
  const title = "Your Aurabella Password Has Been Changed";
  
  const content = `
    <h2 style="font-family:'Didot',Georgia,serif;color:#1e1830;font-size:22px;margin-top:0;font-weight:700;letter-spacing:1px;">Password Changed Successfully</h2>
    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;">
      Hello ${name},
    </p>
    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;">
      This email is a quick confirmation that your Aurabella account password was successfully updated on ${context.date || "Just now"} at ${context.time || ""}.
    </p>
    
    <div style="background-color:#faf8ff;border:1px solid #f0ebf8;border-radius:12px;padding:20px;margin-bottom:25px;">
      <p style="color:#4d445c;margin:0;font-size:13px;line-height:1.6;">
        If you initiated this change, you are all set. You can now log into your profile dashboard using your new password.
      </p>
    </div>

    <p style="color:#e11d48;font-weight:bold;margin-bottom:10px;font-size:14px;">
      Did you not authorize this password update?
    </p>
    <p style="color:#4d445c;margin-bottom:20px;font-size:13px;line-height:1.7;">
      If you did not change your password, please contact our security team immediately at <a href="mailto:support@aurabellaafroz.com" style="color:#7c3aed;text-decoration:none;">support@aurabellaafroz.com</a> to lock your account and secure your data.
    </p>
    
    ${renderButton("Lock Account & Reset", `${BASE_URL}/login?redirect=/account`)}

    <p style="color:#4d445c;margin-top:35px;font-size:11px;line-height:1.7;">
      Aurabella customer support is here to help you around the clock.
    </p>
  `;

  return wrapLayout(title, content);
};
