require("dotenv").config();
const mongoose = require("mongoose");

const Product = require("../models/Product");
const Category = require("../models/Category");
const MONGO_URI = "mongodb+srv://satyamb971_db_user:mQkimJ4UeyRnldla@cluster0.ajggbjn.mongodb.net/?retryWrites=true&w=majority"; // Database name add karna

async function seedSimpleProducts() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("DB Connected");

    const toysCategory = await Category.findOne({ slug: "toys" });

    if (!toysCategory) {
      console.log("Toys category not found. Seed categories first.");
      process.exit(1);
    }

    await Product.deleteMany({});
    console.log("Old products removed");

    const products = [];

    for (let i = 1; i <= 100; i++) {
      products.push({
        productType: "simple",

        name: `Toy Item ${i}`,
        description: `High quality toy item number ${i} for kids.`,

        price: 300 + i * 10,
        stock: 50,

        images: [
          {
            url: "https://images.pexels.com/photos/459976/pexels-photo-459976.jpeg",
            id: `toy-${i}`
          }
        ],

        brand: "ToyZone",
        category: toysCategory._id,

        discount: i % 5 === 0 ? 10 : 0, // every 5th product has discount

        isNewArrival: true,

        freeShipping: true,

        dimensions: {
          length: 20,
          width: 15,
          height: 10,
          weight: 0.5
        },

        materials: ["Plastic"],
        ageGroup: ["3-6", "6-9"],

        tags: ["toy", "kids"],
        keywords: ["kids toy", "play toy"],

        slug: `toy-item-${i}`
      });
    }

    await Product.insertMany(products);
    console.log("100 SIMPLE products inserted successfully");

    process.exit();
  } catch (error) {
    console.error("Seeder error:", error);
    process.exit(1);
  }
}

seedSimpleProducts();
