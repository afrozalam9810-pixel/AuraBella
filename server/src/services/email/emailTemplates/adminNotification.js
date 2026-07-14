const { wrapLayout, renderButton, BASE_URL } = require("../emailComponents");

/**
 * Reusable Admin Notifications Template.
 * Handles: lowStockAlert, newUserRegistered, and newOrderAlert.
 * @param {object} context - { type, details }
 */
module.exports = function adminNotification(context) {
  const { type, details } = context;
  let title = "Aurabella Admin Notification";
  let headline = "";
  let body = "";

  switch (type) {
    case "low_stock":
      title = `Low Stock Alert: ${details.productName}`;
      headline = "Low Stock Alert ⚠️";
      body = `
        <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;">
          Product <strong style="color:#1e1830;">${details.productName}</strong> (ID: ${details.productId}) has fallen below its safe inventory threshold.
        </p>
        <div style="background-color:#faf8ff;border:1px solid #f0ebf8;border-radius:12px;padding:20px;margin-bottom:25px;">
          <table style="width:100%;font-size:13px;color:#4d445c;">
            <tr>
              <td style="padding:4px 0;font-weight:bold;width:120px;">Size:</td>
              <td style="padding:4px 0;">${details.size || "Default"}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-weight:bold;">Color:</td>
              <td style="padding:4px 0;">${details.color || "Default"}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-weight:bold;">Current Stock:</td>
              <td style="padding:4px 0;color:#e11d48;font-weight:bold;">${details.stock} items left</td>
            </tr>
          </table>
        </div>
      `;
      break;
    case "new_user":
      title = "New Member Registration";
      headline = "New User Registered ✦";
      body = `
        <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;">
          A new customer has successfully registered a profile on Aurabella.
        </p>
        <div style="background-color:#faf8ff;border:1px solid #f0ebf8;border-radius:12px;padding:20px;margin-bottom:25px;">
          <table style="width:100%;font-size:13px;color:#4d445c;">
            <tr>
              <td style="padding:4px 0;font-weight:bold;width:120px;">Name:</td>
              <td style="padding:4px 0;">${details.name}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-weight:bold;">Email Address:</td>
              <td style="padding:4px 0;">${details.email}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-weight:bold;">Register Source:</td>
              <td style="padding:4px 0;text-transform:uppercase;">${details.source || "Email"}</td>
            </tr>
          </table>
        </div>
      `;
      break;
    case "new_order":
      title = `New Order Placed: #${details.orderId}`;
      headline = "New Order Placed! 🎉";
      body = `
        <p style="color:#4d445c;margin-bottom:20px;font-size:14px;line-height:1.7;">
          Order <strong style="color:#1e1830;">#${details.orderId}</strong> was placed successfully and is currently waiting for fulfillment processing.
        </p>
        <div style="background-color:#faf8ff;border:1px solid #f0ebf8;border-radius:12px;padding:20px;margin-bottom:25px;">
          <table style="width:100%;font-size:13px;color:#4d445c;">
            <tr>
              <td style="padding:4px 0;font-weight:bold;width:120px;">Customer Name:</td>
              <td style="padding:4px 0;">${details.customerName}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-weight:bold;">Final Amount:</td>
              <td style="padding:4px 0;font-weight:bold;color:#7c3aed;">₹${details.amount.toLocaleString("en-IN")}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-weight:bold;">Payment Method:</td>
              <td style="padding:4px 0;text-transform:uppercase;">${details.paymentMethod}</td>
            </tr>
          </table>
        </div>
      `;
      break;
    default:
      headline = "System Notification";
      body = `<p style="color:#4d445c;font-size:14px;">${JSON.stringify(details)}</p>`;
  }

  const content = `
    <h2 style="font-family:'Didot',Georgia,serif;color:#1e1830;font-size:22px;margin-top:0;font-weight:700;letter-spacing:1px;">${headline}</h2>
    
    ${body}

    ${renderButton("Access Admin Panel", `${BASE_URL}/admin`)}

    <p style="color:#9d8bbb;margin-top:35px;font-size:11px;line-height:1.7;border-top:1px solid #f0ebf8;padding-top:20px;text-align:center;">
      AuraBella Admin Notification Dispatch. All rights reserved.
    </p>
  `;

  return wrapLayout(title, content);
};
