const { wrapLayout, renderButton, BASE_URL } = require("../emailComponents");

/**
 * Generate Profile Details Updated Email.
 * @param {object} context - { name, changes } (changes is an array of strings like ['Email Address', 'Phone Number'])
 */
module.exports = function profileUpdated(context) {
  const name = context.name || "Valued Customer";
  const title = "Your Aurabella Profile Has Been Updated";
  
  let changesList = "";
  context.changes?.forEach((c) => {
    changesList += `<li style="padding:4px 0;"><strong>${c}</strong></li>`;
  });

  const content = `
    <h2 style="font-family:'Didot',Georgia,serif;color:#1e1830;font-size:22px;margin-top:0;font-weight:700;letter-spacing:1px;">Security Confirmation</h2>
    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;">
      Hello ${name},
    </p>
    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;">
      This is a quick security confirmation to inform you that key credentials on your Aurabella account profile were successfully updated.
    </p>
    
    <div style="background-color:#faf8ff;border:1px solid #f0ebf8;border-radius:12px;padding:20px;margin-bottom:25px;">
      <h4 style="margin:0 0 8px 0;font-size:12px;color:#1e1830;text-transform:uppercase;letter-spacing:1px;">Changes Saved</h4>
      <ul style="margin:0;padding-left:20px;font-size:13px;color:#4d445c;">
        ${changesList || '<li style="padding:4px 0;">Profile Address Details</li>'}
      </ul>
    </div>

    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;">
      If you authorized these updates, you are all set. No further action is required.
    </p>
    <p style="color:#e11d48;font-weight:bold;margin-bottom:10px;font-size:14px;">
      Did you not authorize these profile updates?
    </p>
    <p style="color:#4d445c;margin-bottom:20px;font-size:13px;line-height:1.7;">
      If you did not request these modifications, your account security might be compromised. Please lock your account and change your password immediately by clicking the button below:
    </p>
    
    ${renderButton("Change Password", `${BASE_URL}/login?redirect=/account`)}

    <p style="color:#4d445c;margin-top:35px;font-size:11px;line-height:1.7;">
      Need help? Reach out to support at <a href="mailto:support@aurabellaafroz.com" style="color:#7c3aed;text-decoration:none;">support@aurabellaafroz.com</a>.
    </p>
  `;

  return wrapLayout(title, content);
};
