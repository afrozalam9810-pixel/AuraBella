/**
 * generateSitemap.js
 * Script to generate a static sitemap.xml in client/public.
 */

const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/aurabella";
const BASE_URL = "https://www.aurabellaafroz.com";

// Define schemas to fetch data
const categorySchema = new mongoose.Schema({
  slug: String,
  subCategories: [{ slug: String }]
});

const productSchema = new mongoose.Schema({
  name: String,
  updatedAt: Date
});

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

async function generate() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI);
  console.log("Connected successfully.");

  // 1. Static Routes
  const staticRoutes = [
    "",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/return-policy",
    "/shipping-policy",
    "/faq",
    "/cart",
    "/login",
    "/register"
  ].map(route => ({
    loc: `${BASE_URL}${route}`,
    lastmod: new Date().toISOString().split("T")[0],
    changefreq: "weekly",
    priority: route === "" ? "1.0" : "0.8"
  }));

  // 2. Fetch Category Routes
  console.log("Fetching categories...");
  const categories = await Category.find({});
  const categoryRoutes = [];
  categories.forEach(cat => {
    if (cat.slug) {
      categoryRoutes.push({
        loc: `${BASE_URL}/category/${cat.slug}`,
        lastmod: new Date().toISOString().split("T")[0],
        changefreq: "weekly",
        priority: "0.8"
      });
    }
    cat.subCategories?.forEach(sub => {
      if (sub.slug) {
        categoryRoutes.push({
          loc: `${BASE_URL}/category/${sub.slug}`,
          lastmod: new Date().toISOString().split("T")[0],
          changefreq: "weekly",
          priority: "0.7"
        });
      }
    });
  });

  // 3. Fetch Product Routes
  console.log("Fetching products...");
  const products = await Product.find({});
  const productRoutes = [];
  products.forEach(prod => {
    // Custom helper to slugify name
    const slugify = (text) =>
      text
        ?.toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "")
        .replace(/\-\-+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "") || "";

    const nameSlug = slugify(prod.name);
    const urlSlug = nameSlug ? `${prod._id}-${nameSlug}` : prod._id;
    productRoutes.push({
      loc: `${BASE_URL}/product/${urlSlug}`,
      lastmod: new Date(prod.updatedAt || Date.now()).toISOString().split("T")[0],
      changefreq: "daily",
      priority: "0.9"
    });
  });

  // Merge routes
  const allRoutes = [...staticRoutes, ...categoryRoutes, ...productRoutes];

  // Construct XML
  console.log("Constructing XML content...");
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  allRoutes.forEach(route => {
    xml += "  <url>\n";
    xml += `    <loc>${route.loc}</loc>\n`;
    xml += `    <lastmod>${route.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += "  </url>\n";
  });
  
  xml += "</urlset>\n";

  // Write to client/public/sitemap.xml
  const publicDir = path.resolve(__dirname, "../client/public");
  
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const sitemapPath = path.join(publicDir, "sitemap.xml");
  fs.writeFileSync(sitemapPath, xml, "utf8");
  console.log(`Successfully generated static sitemap at: ${sitemapPath}`);

  await mongoose.disconnect();
}

generate().catch(err => {
  console.error("Sitemap generation error:", err);
  process.exit(1);
});
