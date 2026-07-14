const { wrapLayout, renderButton, BASE_URL } = require("../emailComponents");

/**
 * Generate Security Login Alert Email.
 * @param {object} context - { name, time, date, browser, device, ip, location }
 */
module.exports = function loginAlert(context) {
  const name = context.name || "Valued Customer";
  const title = "New Login Alert | Aurabella";
  
  const content = `
    <h2 style="font-family:'Didot',Georgia,serif;color:#1e1830;font-size:22px;margin-top:0;font-weight:700;letter-spacing:1px;">Security Notification</h2>
    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;">
      Hello ${name},
    </p>
    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;">
      This is a quick security notification to let you know that your Aurabella account was successfully logged into from a new browser or device.
    </p>
    
    <div style="background-color:#faf8ff;border:1px solid #f0ebf8;border-radius:12px;padding:20px;margin-bottom:25px;">
      <h3 style="margin:0 0 12px 0;font-size:13px;color:#1e1830;text-transform:uppercase;letter-spacing:1px;">Login Details</h3>
      <table style="width:100%;font-size:13px;color:#4d445c;">
        <tr>
          <td style="padding:4px 0;font-weight:bold;width:120px;">Date &amp; Time:</td>
          <td style="padding:4px 0;">${context.date || "Just now"} at ${context.time || ""}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-weight:bold;">Browser:</td>
          <td style="padding:4px 0;">${context.browser || "Unknown"}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-weight:bold;">Device:</td>
          <td style="padding:4px 0;">${context.device || "Unknown"}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-weight:bold;">IP Address:</td>
          <td style="padding:4px 0;">${context.ip || "Unknown"}</td>
        </tr>
        ${context.location ? `
        <tr>
          <td style="padding:4px 0;font-weight:bold;">Approx Location:</td>
          <td style="padding:4px 0;">${context.location}</td>
        </tr>
        ` : ""}
      </table>
    </div>

    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;">
      If this was you, no action is required. You can continue shopping securely.
    </p>
    <p style="color:#e11d48;font-weight:bold;margin-bottom:10px;font-size:14px;">
      Was this not you?
    </p>
    <p style="color:#4d445c;margin-bottom:20px;font-size:13px;line-height:1.7;">
      If you did not authorize this login, your account password may be compromised. Please click the button below to reset your password immediately:
    </p>
    
    ${renderButton("Reset Password", `${BASE_URL}/login?redirect=/account`)}

    <p style="color:#4d445c;margin-top:30px;font-size:11px;line-height:1.7;">
      Need assistance? Contact our security support at <a href="mailto:support@aurabellaafroz.com" style="color:#7c3aed;text-decoration:none;">support@aurabellaafroz.com</a>.
    </p>
  `;

  return wrapLayout(title, content);
};
