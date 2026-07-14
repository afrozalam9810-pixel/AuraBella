const { wrapLayout, renderButton, BASE_URL } = require("../emailComponents");

/**
 * Generate Account Deleted Confirmation Email.
 * @param {object} context - { name }
 */
module.exports = function accountDeleted(context) {
  const name = context.name || "Valued Customer";
  const title = "Your Aurabella Account Has Been Closed";
  
  const content = `
    <h2 style="font-family:'Didot',Georgia,serif;color:#1e1830;font-size:22px;margin-top:0;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Account Closed</h2>
    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;">
      Hello ${name},
    </p>
    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;">
      We confirm that your Aurabella customer account has been successfully closed and your personal data has been deleted from our active databases, in accordance with our Privacy Policy guidelines.
    </p>
    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;">
      We are sad to see you go! If you ever decide to return to discover our luxury collections, ethnic wear, and latest trends, you can easily register a new profile at any time.
    </p>

    ${renderButton("Discover Latest Trends", `${BASE_URL}`)}

    <p style="color:#4d445c;margin-top:35px;font-size:12px;line-height:1.7;border-top:1px solid #f0ebf8;padding-top:20px;text-align:center;">
      If you did not make this deletion request, please contact our support team immediately at <a href="mailto:support@aurabellaafroz.com" style="color:#7c3aed;text-decoration:none;">support@aurabellaafroz.com</a>.
    </p>
  `;

  return wrapLayout(title, content);
};
