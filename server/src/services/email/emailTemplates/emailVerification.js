const { wrapLayout, renderButton, BASE_URL } = require("../emailComponents");

/**
 * Generate Email Verification Request Email.
 * @param {object} context - { name, otp, link }
 */
module.exports = function emailVerification(context) {
  const name = context.name || "Valued Customer";
  const title = "Verify Your Aurabella Account Email";
  
  let verificationAction = "";
  if (context.otp) {
    verificationAction = `
      <div style="text-align:center;margin:30px 0;">
        <span style="display:inline-block;background-color:#faf8ff;border:1px dashed #7c3aed;color:#7c3aed;padding:12px 32px;font-size:24px;font-weight:bold;letter-spacing:4px;border-radius:12px;">
          ${context.otp}
        </span>
        <p style="color:#9d8bbb;font-size:11px;margin-top:10px;">This OTP verification code is valid for 10 minutes.</p>
      </div>
    `;
  } else if (context.link) {
    verificationAction = renderButton("Verify Email Address", context.link);
  } else {
    verificationAction = renderButton("Verify Account", `${BASE_URL}/login`);
  }

  const content = `
    <h2 style="font-family:'Didot',Georgia,serif;color:#1e1830;font-size:22px;margin-top:0;font-weight:700;letter-spacing:1px;">Confirm Your Email</h2>
    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;">
      Hello ${name},
    </p>
    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;">
      Thank you for registering at <strong>Aurabella</strong>! Please confirm your email address to unlock your account privileges and experience personalized premium shopping.
    </p>
    
    ${verificationAction}

    <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;">
      Verifying your email ensures that your account details remain secure, and allows you to check out seamlessly on your next purchase.
    </p>

    <p style="color:#4d445c;margin-top:35px;font-size:12px;line-height:1.7;border-t:1px solid #f0ebf8;padding-top:20px;">
      If you did not initiate this registration, you can safely ignore this email.
    </p>
  `;

  return wrapLayout(title, content);
};
