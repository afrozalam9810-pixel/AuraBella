const { wrapLayout, renderButton, BASE_URL } = require("../emailComponents");

/**
 * Generate Contact Support Form template.
 * Handles: Admin notification of submission, and customer auto-acknowledgement.
 * @param {object} context - { isAdmin, name, email, subject, message }
 */
module.exports = function contactReply(context) {
  const name = context.name || "Valued Customer";
  const title = context.isAdmin ? "New Contact Form Inquiry" : "We Received Your Message | Aurabella";
  
  let content = "";
  if (context.isAdmin) {
    content = `
      <h2 style="font-family:'Didot',Georgia,serif;color:#1e1830;font-size:22px;margin-top:0;font-weight:700;letter-spacing:1px;">New Customer Inquiry</h2>
      <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;">
        An inquiry has been submitted via the Aurabella contact form. Details are listed below:
      </p>

      <div style="background-color:#faf8ff;border:1px solid #f0ebf8;border-radius:12px;padding:20px;margin-bottom:25px;">
        <table style="width:100%;font-size:13px;color:#4d445c;">
          <tr>
            <td style="padding:4px 0;font-weight:bold;width:120px;">Customer Name:</td>
            <td style="padding:4px 0;">${name}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;font-weight:bold;">Email Address:</td>
            <td style="padding:4px 0;"><a href="mailto:${context.email}" style="color:#7c3aed;text-decoration:none;">${context.email}</a></td>
          </tr>
          <tr>
            <td style="padding:4px 0;font-weight:bold;">Subject:</td>
            <td style="padding:4px 0;font-weight:bold;color:#1e1830;">${context.subject || "No Subject"}</td>
          </tr>
          <tr>
            <td style="padding:8px 0 4px 0;font-weight:bold;vertical-align:top;" colspan="2">Message:</td>
          </tr>
          <tr>
            <td style="padding:8px;background-color:#ffffff;border:1px solid #f0ebf8;border-radius:8px;font-size:13px;line-height:1.6;" colspan="2">
              ${context.message || ""}
            </td>
          </tr>
        </table>
      </div>

      ${renderButton("Access Admin Dashboard", `${BASE_URL}/admin`)}
    `;
  } else {
    content = `
      <h2 style="font-family:'Didot',Georgia,serif;color:#1e1830;font-size:22px;margin-top:0;font-weight:700;letter-spacing:1px;">Inquiry Received</h2>
      <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;">
        Hello ${name},
      </p>
      <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;">
        Thank you for contacting <strong>Aurabella Support</strong>! We have successfully received your message regarding: <strong>"${context.subject || "Customer Inquiry"}"</strong>.
      </p>
      <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;">
        Our customer care agents will review your inquiry details and get back to you with a resolution within 24 business hours.
      </p>

      <div style="background-color:#faf8ff;border:1px solid #f0ebf8;border-radius:12px;padding:20px;margin-bottom:25px;">
        <h4 style="margin:0 0 8px 0;font-size:12px;color:#1e1830;text-transform:uppercase;letter-spacing:1px;">Summary of Your Message</h4>
        <p style="margin:0;font-size:13px;line-height:1.6;color:#6b5d7d;font-style:italic;">
          "${context.message}"
        </p>
      </div>

      ${renderButton("Discover Latest Trends", `${BASE_URL}`)}

      <p style="color:#4d445c;margin-top:35px;font-size:12px;line-height:1.7;">
        If you have urgent questions, feel free to reply directly to this email or call our care lines at +91-98765-43210.
      </p>
    `;
  }

  return wrapLayout(title, content);
};
