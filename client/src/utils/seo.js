/**
 * seo.js
 * Utility functions for search engine optimization.
 */

/**
 * Generate a URL-friendly slug from string content.
 * @param {string} text - The input text (e.g. product name)
 * @returns {string} - Clean hyphen-separated alphanumeric slug
 */
export const slugify = (text) =>
  text
    ?.toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word characters
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start
    .replace(/-+$/, "") || ""; // Trim - from end

/**
 * Generate an SEO-friendly hybrid URL path for a product.
 * @param {object} product - Mongoose Product doc or JSON structure
 * @returns {string} - Combined ID and title slug path (e.g. /product/123-zara-top)
 */
export const getProductUrl = (product) => {
  if (!product) return "/";
  const id = product._id;
  const nameSlug = slugify(product.name);
  return nameSlug ? `/product/${id}-${nameSlug}` : `/product/${id}`;
};
