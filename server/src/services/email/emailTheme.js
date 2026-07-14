/**
 * emailTheme.js
 * Central brand design token registry for all Aurabella email templates.
 *
 * HOW TO RESTYLE:
 *   Change a value here and every template updates automatically.
 *   No need to hunt through individual template strings.
 */

const BRAND = {
  // ── Colours ─────────────────────────────────────────────────────────────────
  primaryDark:    "#1e1830",   // Deep violet-black (background base)
  primaryDeeper:  "#0b0713",   // Near-black for gradient terminus
  primaryAccent:  "#7c3aed",   // Vivid violet (button start, links)
  primaryGlow:    "#d946ef",   // Fuchsia gold accent (button end, underlines)
  muted:          "#9d8bbb",   // Muted lavender for secondary text
  mutedLight:     "#6b5d7d",   // Slightly brighter muted for address text
  surface:        "#ffffff",   // Email card surface
  surfaceAlt:     "#faf8ff",   // Card inner background
  surfaceTint:    "#fcfbfe",   // Body background / table row alt
  border:         "#f0ebf8",   // Subtle divider / border colour
  text:           "#2e2a36",   // Primary content text
  textBody:       "#4d445c",   // Body paragraph text
  textBold:       "#1e1830",   // Strong / bold text
  white:          "#ffffff",

  // ── Typography ───────────────────────────────────────────────────────────────
  fontSerif:      "'Didot', Georgia, serif",
  fontSans:       "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",

  // ── Sizing ────────────────────────────────────────────────────────────────────
  containerWidth: "600px",
  borderRadius:   "16px",
  borderRadiusCard: "12px",
  borderRadiusPill: "9999px",

  // ── Shadows / Glow ────────────────────────────────────────────────────────────
  shadowCard:     "0 4px 12px rgba(124,58,237,0.03)",
  shadowButton:   "0 4px 12px rgba(217,70,239,0.3)",

  // ── Site ─────────────────────────────────────────────────────────────────────
  siteUrl:        "https://www.aurabellaafroz.com",
  supportEmail:   "contact@aurabellaafroz.com",
  companyName:    "Aurabella Fashion India",
  address:        "Ground Floor, Landmark Tower, Mumbai, Maharashtra 400001, India",
  year:           new Date().getFullYear(),
};

/**
 * Derived inline-CSS string map built entirely from BRAND tokens.
 * All email templates import `styles` from here — never hardcode colours directly.
 */
const styles = {
  body:            `margin:0;padding:0;background-color:${BRAND.surfaceTint};font-family:${BRAND.fontSans};-webkit-text-size-adjust:100%;`,
  container:       `max-width:${BRAND.containerWidth};margin:20px auto;background-color:${BRAND.surface};border:1px solid ${BRAND.border};border-radius:${BRAND.borderRadius};overflow:hidden;box-shadow:${BRAND.shadowCard};`,
  header:          `background:linear-gradient(135deg,${BRAND.primaryDark} 0%,${BRAND.primaryDeeper} 100%);padding:30px;text-align:center;border-bottom:3px solid ${BRAND.primaryGlow};`,
  logo:            `color:${BRAND.primaryGlow};font-size:28px;font-family:${BRAND.fontSerif};font-weight:bold;letter-spacing:4px;text-transform:uppercase;text-decoration:none;margin:0;`,
  subTitle:        `color:${BRAND.muted};font-size:10px;text-transform:uppercase;letter-spacing:3px;margin-top:6px;font-weight:600;`,
  content:         `padding:40px 30px;color:${BRAND.text};line-height:1.6;font-size:14px;`,
  title:           `font-family:${BRAND.fontSerif};color:${BRAND.primaryDark};font-size:22px;margin-top:0;margin-bottom:20px;font-weight:700;letter-spacing:1px;`,
  text:            `color:${BRAND.textBody};margin-bottom:20px;font-size:14px;line-height:1.7;`,
  bold:            `font-weight:bold;color:${BRAND.textBold};`,
  buttonContainer: `text-align:center;margin:30px 0;`,
  button:          `display:inline-block;background:linear-gradient(135deg,${BRAND.primaryAccent} 0%,${BRAND.primaryGlow} 100%);color:${BRAND.white} !important;text-decoration:none !important;padding:14px 32px;font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;border-radius:${BRAND.borderRadiusPill};box-shadow:${BRAND.shadowButton};`,
  divider:         `border:0;border-top:1px solid ${BRAND.border};margin:25px 0;`,
  card:            `background-color:${BRAND.surfaceAlt};border:1px solid ${BRAND.border};border-radius:${BRAND.borderRadiusCard};padding:20px;margin-bottom:25px;`,
  table:           `width:100%;border-collapse:collapse;margin:20px 0;`,
  th:              `text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:${BRAND.muted};padding-bottom:10px;border-bottom:1px solid ${BRAND.border};`,
  td:              `padding:12px 0;border-bottom:1px solid ${BRAND.surfaceTint};font-size:13px;vertical-align:middle;`,
  footer:          `background-color:${BRAND.primaryDark};padding:35px 30px;text-align:center;color:${BRAND.muted};font-size:11px;line-height:1.7;`,
  footerLinks:     `color:${BRAND.primaryGlow};text-decoration:none;margin:0 8px;font-weight:600;`,
  address:         `margin-top:20px;color:${BRAND.mutedLight};font-style:normal;font-size:10px;`,
};

module.exports = { BRAND, styles };
