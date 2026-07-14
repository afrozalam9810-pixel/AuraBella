/**
 * emailComponents.js
 * Reusable layout wrapper and components for Aurabella HTML emails.
 *
 * All colours and typography come from emailTheme.js — never hardcode here.
 */

const { BRAND, styles } = require("./emailTheme");

/**
 * Standard Layout Wrapper
 * Injects the branded header + footer around any content block.
 *
 * @param {string} titleText   - <title> tag value (appears in email client tabs)
 * @param {string} contentHtml - Inner HTML to render inside the content area
 */
const wrapLayout = (titleText, contentHtml) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="light dark">
        <meta name="supported-color-schemes" content="light dark">
        <title>${titleText}</title>
      </head>
      <body style="${styles.body}">
        <div style="${styles.container}">
          
          <!-- Header -->
          <div style="${styles.header}">
            <a href="${BRAND.siteUrl}" style="${styles.logo}">AURABELLA</a>
            <div style="${styles.subTitle}">Exquisite Luxury · Designed to Shine</div>
          </div>
          
          <!-- Main Content -->
          <div style="${styles.content}">
            ${contentHtml}
          </div>
          
          <!-- Footer -->
          <div style="${styles.footer}">
            <div>
              <a href="${BRAND.siteUrl}/faq" style="${styles.footerLinks}">Help &amp; FAQs</a> |
              <a href="${BRAND.siteUrl}/terms" style="${styles.footerLinks}">Terms &amp; Conditions</a> |
              <a href="${BRAND.siteUrl}/privacy" style="${styles.footerLinks}">Privacy Policy</a>
            </div>
            <div style="margin-top:15px;">
              Follow us:
              <a href="https://instagram.com/aurabella" style="color:${BRAND.primaryGlow};text-decoration:none;margin-left:5px;">Instagram</a> ·
              <a href="https://facebook.com/aurabella" style="color:${BRAND.primaryGlow};text-decoration:none;margin-left:5px;">Facebook</a>
            </div>
            <p style="${styles.address}">
              &copy; ${BRAND.year} ${BRAND.companyName}. All rights reserved.<br>
              Corporate HQ: ${BRAND.address}<br>
              Contact support at ${BRAND.supportEmail}.
            </p>
          </div>
          
        </div>
      </body>
    </html>
  `;
};

/**
 * Reusable CTA Button Component
 * @param {string} text - Button label
 * @param {string} url  - Destination URL
 */
const renderButton = (text, url) => {
  return `
    <div style="${styles.buttonContainer}">
      <a href="${url}" target="_blank" style="${styles.button}">${text}</a>
    </div>
  `;
};

/**
 * Alert / highlight card (e.g. for OTPs, important notices)
 * @param {string} content - Inner HTML content
 */
const renderCard = (content) => {
  return `<div style="${styles.card}">${content}</div>`;
};

/**
 * Horizontal rule divider
 */
const renderDivider = () => `<hr style="${styles.divider}">`;

module.exports = {
  styles,
  BRAND,
  wrapLayout,
  renderButton,
  renderCard,
  renderDivider,
  // Legacy alias — keep BASE_URL for existing templates that still use it
  BASE_URL: BRAND.siteUrl,
};
