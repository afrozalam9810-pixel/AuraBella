/**
 * seed.js
 * Database seeding script to populate Category, Product, and Admin User collections.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/User.model");
const Category = require("./src/models/Category.model");
const Product = require("./src/models/Product.model");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/aurabella";

const categoriesData = [
  {
    name: "Clothing",
    slug: "clothing",
    subs: ["Tops", "Dresses", "Ethnic Wear", "Bottoms"],
  },
  {
    name: "Footwear",
    slug: "footwear",
    subs: ["Heels", "Flats", "Sneakers", "Sandals"],
  },
  {
    name: "Makeup",
    slug: "makeup",
    subs: ["Lipstick", "Foundation", "Eye Makeup", "Skincare"],
  },
  {
    name: "Jewellery",
    slug: "jewellery",
    subs: ["Earrings", "Necklaces", "Bracelets", "Bags"],
  },
];

const brands = {
  Clothing: ["Zara", "H&M", "Mango", "AuraBella Style", "Vero Moda"],
  Footwear: ["Steve Madden", "Nike", "Adidas", "AuraBella Step", "Aldo"],
  Makeup: ["L'Oreal", "MAC", "Maybelline", "Estee Lauder", "AuraBella Glow"],
  Jewellery: ["Tiffany & Co.", "Pandora", "Swarovski", "Cartier", "AuraBella Luxe"],
};

const colors = ["Crimson Red", "Champagne Gold", "Midnight Black", "Blush Pink", "Lavender Violet"];
const sizes = {
  Clothing: ["XS", "S", "M", "L", "XL"],
  Footwear: ["36", "37", "38", "39", "40"],
  Makeup: ["Standard"],
  Jewellery: ["One Size"],
};

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomPrice = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

const generateProducts = (parentCategory, subCategory, parentName, subName) => {
  const products = [];
  const brandList = brands[parentName] || ["AuraBella"];
  const sizeList = sizes[parentName] || ["Standard"];

  for (let i = 1; i <= 5; i++) {
    const brand = getRandom(brandList);
    const name = `${brand} Premium ${subName} Vol ${i}`;
    const price = getRandomPrice(500, 5000);
    // 50% chance of having a discount price
    const discountPrice = Math.random() > 0.5 ? Math.floor(price * 0.8) : null;
    const descSubName = subName.toLowerCase();

    // Create realistic variants
    const variants = [];
    if (parentName === "Clothing" || parentName === "Footwear") {
      // Create sizes and colors variants
      sizeList.forEach((size) => {
        const color = getRandom(colors);
        variants.push({
          size,
          color,
          stock: getRandomPrice(10, 100),
        });
      });
    } else {
      // Single size, but a couple of color/shades variant
      for (let j = 0; j < 3; j++) {
        variants.push({
          size: sizeList[0],
          color: getRandom(colors),
          stock: getRandomPrice(5, 50),
        });
      }
    }

    products.push({
      name,
      description: `Elevate your standard with the ${name}. A high-quality, beautifully designed ${descSubName} from ${brand}. Perfect for daily luxury, parties, and corporate wear. Made with premium, durable materials.`,
      category: parentCategory._id,
      subCategory: subCategory._id,
      brand,
      price,
      discountPrice,
      images: [
        `https://placehold.co/600x400/2a1040/f0e8ff?text=${encodeURIComponent(name)}`,
        `https://placehold.co/600x400/1e1830/f0e8ff?text=${encodeURIComponent(name)}+Detail`,
      ],
      variants,
      avgRating: Number((Math.random() * 1.5 + 3.5).toFixed(1)), // 3.5 to 5.0 rating
      numReviews: getRandomPrice(5, 120),
    });
  }

  return products;
};

const seedDB = async () => {
  try {
    console.log("Connecting to Database:", MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully to database!");

    // 1. Clear existing collections
    console.log("Clearing collections (User, Category, Product)...");
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log("Collections cleared successfully.");

    // 2. Create Admin User
    console.log("Creating admin user...");
    const admin = await User.create({
      name: "AuraBella Admin",
      email: "admin@aurabella.com",
      password: "admin1234Password!", // Will be hashed via User schema pre-save hook
      role: "admin",
      isVerified: true,
      addresses: [
        {
          label: "Corporate Office",
          line1: "AuraBella Towers, Floor 14",
          line2: "Commercial District, MG Road",
          city: "Bangalore",
          state: "Karnataka",
          pincode: "560001",
          phone: "9876543210",
          isDefault: true,
        },
      ],
    });
    console.log(`Admin user created: ${admin.email}`);

    // 3. Create Categories and Products
    console.log("Generating Categories and Products...");
    for (const catData of categoriesData) {
      // Create Parent Category
      const parentCat = await Category.create({
        name: catData.name,
        slug: catData.slug,
        parentCategory: null,
      });
      console.log(`Created Parent Category: ${parentCat.name}`);

      for (const subName of catData.subs) {
        // Create Sub Category
        const subCat = await Category.create({
          name: subName,
          slug: `${catData.slug}-${subName.toLowerCase().replace(/\s+/g, "-")}`,
          parentCategory: parentCat._id,
        });
        console.log(`  Created Sub Category: ${subCat.name}`);

        // Generate and insert 5 products for this subcategory
        const products = generateProducts(parentCat, subCat, catData.name, subName);
        await Product.insertMany(products);
        console.log(`    Inserted 5 products into ${subCat.name}`);
      }
    }

    console.log("Database seeded successfully! 🌱");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error.message);
    process.exit(1);
  }
};

seedDB();
