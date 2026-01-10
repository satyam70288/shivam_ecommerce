const mongoose = require("mongoose");
const Product = require("./models/Product");
require("dotenv").config();

const MONGO_URL = process.env.MONGO_URL;

// CATEGORY IDS YOU PROVIDED
const CATEGORY = {
  TOYS: "693a66c0139036523d5a7cf0",
  GIFTS: "693a66c0139036523d5a7cf3",
  STATIONERY: "693a66c1139036523d5a7cf6",
  COSMETICS: "693a66c1139036523d5a7cf9",
};

// Image sources (safe + free + permanent)
const IMAGES = {
  TOYS: [
    "https://images.unsplash.com/photo-1601758124515-4e31df24e1c6",
    "https://images.unsplash.com/photo-1587300003388-59208cc962cb",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b",
  ],
  GIFTS: [
    "https://images.unsplash.com/photo-1513785077084-84adb77e90ab",
    "https://images.unsplash.com/photo-1512389098783-66b81f86e5a0",
    "https://images.unsplash.com/photo-1512591290630-09f2d2f0b25c",
  ],
  STATIONERY: [
    "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f",
    "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d",
    "https://images.unsplash.com/photo-1501706362039-c06b2d715385",
  ],
  COSMETICS: [
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9",
    "https://images.unsplash.com/photo-1585386959984-a4155223165a",
    "https://images.unsplash.com/photo-1583241802624-05657c7d5b89",
  ],
};

// Generate product for a category
function generateProduct(namePrefix, categoryId, images, index) {
  return {
    productType: "simple",
    name: `${namePrefix} Product ${index}`,
    description: `High-quality ${namePrefix.toLowerCase()} product. Perfect for everyday use and gifting.`,
    price: Math.floor(Math.random() * 500) + 100, // 100–600
    stock: Math.floor(Math.random() * 50) + 10,
    images: [
      {
        url: images[index % images.length],
        id: `${namePrefix.toLowerCase()}_${index}`,
      },
    ],
    category: categoryId,
    discount: Math.random() < 0.3 ? Math.floor(Math.random() * 20) + 5 : 0, // 5%–25%
    offerTitle: "Limited Time Offer",
    offerDescription: "Special discount for a short period.",
    offerValidFrom: new Date(),
    offerValidTill: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };
}

async function seed() {
  try {
    await mongoose.connect("mongodb+srv://satyamb971_db_user:mQkimJ4UeyRnldla@cluster0.ajggbjn.mongodb.net/");
   

    const allProducts = [];

    for (let i = 1; i <= 50; i++) {
      allProducts.push(generateProduct("Toys", CATEGORY.TOYS, IMAGES.TOYS, i));
      allProducts.push(generateProduct("Gifts", CATEGORY.GIFTS, IMAGES.GIFTS, i));
      allProducts.push(
        generateProduct("Stationery", CATEGORY.STATIONERY, IMAGES.STATIONERY, i)
      );
      allProducts.push(
        generateProduct("Cosmetics", CATEGORY.COSMETICS, IMAGES.COSMETICS, i)
      );
    }

    await Product.insertMany(allProducts);

   
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
