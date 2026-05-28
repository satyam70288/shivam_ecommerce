/**
 * Deletes all products and seeds 2 products per category.
 * Run from server folder: npm run seed:products
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Category = require("../models/Category");

const PRODUCTS_PER_CATEGORY = 2;

const CATEGORIES = [
  { name: "Toys", slug: "toys" },
  { name: "Gifts", slug: "gifts" },
  { name: "Stationery", slug: "stationery" },
  { name: "Cosmetics", slug: "cosmetics" },
  { name: "Imitation Jewellery", slug: "imitation-jewellery" },
  { name: "Pooja Samagri", slug: "pooja-essentials" },
  { name: "Bags", slug: "bags" },
];

const CATEGORY_PRODUCTS = {
  toys: [
    {
      name: "Remote Control Car",
      description:
        "Battery-operated remote control car for kids. Durable plastic body, smooth wheels, ideal for ages 6+.",
      price: 499,
      stock: 40,
      image:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop",
      materials: ["Plastic"],
      ageGroup: ["6-9", "9-12"],
      tags: ["toy", "car", "kids"],
    },
    {
      name: "Building Blocks Set (50 pcs)",
      description:
        "Colorful building blocks set that improves creativity and motor skills. Safe for toddlers with smooth edges.",
      price: 349,
      stock: 55,
      image:
        "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&auto=format&fit=crop",
      materials: ["Plastic"],
      ageGroup: ["3-6", "6-9"],
      tags: ["toy", "blocks", "educational"],
    },
  ],
  gifts: [
    {
      name: "Decorative Gift Hamper Box",
      description:
        "Premium gift hamper box suitable for birthdays and festivals. Elegant finish with ribbon-ready design.",
      price: 299,
      stock: 30,
      image:
        "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop",
      materials: ["Paper", "Other"],
      tags: ["gift", "hamper", "festival"],
    },
    {
      name: "LED Photo Frame Gift Set",
      description:
        "Stylish LED photo frame — a thoughtful gift for family and friends. USB powered warm light.",
      price: 599,
      stock: 25,
      image:
        "https://images.unsplash.com/photo-1513884789691-4c289ed1cde2?w=800&auto=format&fit=crop",
      materials: ["Plastic", "Other"],
      tags: ["gift", "frame", "home decor"],
      discount: 10,
    },
  ],
  stationery: [
    {
      name: "School Stationery Combo Pack",
      description:
        "Complete stationery combo: pens, pencils, eraser, sharpener and scale. Perfect for school students.",
      price: 199,
      stock: 80,
      image:
        "https://images.unsplash.com/photo-1583485088034-697b5c153932?w=800&auto=format&fit=crop",
      materials: ["Paper", "Plastic"],
      tags: ["stationery", "school", "combo"],
    },
    {
      name: "A4 Notebook Pack (5 pcs)",
      description:
        "Ruled A4 notebooks with sturdy cover. 180 pages each, ideal for notes and homework.",
      price: 249,
      stock: 60,
      image:
        "https://images.unsplash.com/photo-1531346878377-a5be20811fe2?w=800&auto=format&fit=crop",
      materials: ["Paper"],
      tags: ["stationery", "notebook", "school"],
    },
  ],
  cosmetics: [
    {
      name: "Herbal Face Cream 50g",
      description:
        "Moisturizing herbal face cream for daily use. Suitable for all skin types, light fragrance.",
      price: 179,
      stock: 45,
      image:
        "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&auto=format&fit=crop",
      materials: ["Other"],
      tags: ["cosmetics", "skincare", "cream"],
    },
    {
      name: "Lip Balm & Hand Cream Set",
      description:
        "Winter care combo — nourishing lip balm and hand cream. Compact pack, easy to carry.",
      price: 149,
      stock: 50,
      image:
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&auto=format&fit=crop",
      materials: ["Other"],
      tags: ["cosmetics", "lip balm", "hand cream"],
      discount: 15,
    },
  ],
  "imitation-jewellery": [
    {
      name: "Gold-Plated Earrings Pair",
      description:
        "Trendy gold-plated earrings for daily and party wear. Hypoallergenic hooks, lightweight design.",
      price: 199,
      stock: 35,
      image:
        "https://images.unsplash.com/photo-1535632066927-ab7c9f608033?w=800&auto=format&fit=crop",
      materials: ["Alloy"],
      tags: ["jewellery", "earrings", "fashion"],
    },
    {
      name: "Designer Bangles Set (6 pcs)",
      description:
        "Beautiful imitation bangles set with traditional design. Ideal for weddings and festivals.",
      price: 349,
      stock: 28,
      image:
        "https://images.unsplash.com/photo-1611591437281-4609be9943a3?w=800&auto=format&fit=crop",
      materials: ["Alloy"],
      tags: ["jewellery", "bangles", "traditional"],
      isFeatured: true,
    },
  ],
  "pooja-essentials": [
    {
      name: "Pooja Thali Set (Brass Finish)",
      description:
        "Complete pooja thali with diya, kumkum holder and incense stand. Traditional brass finish look.",
      price: 449,
      stock: 22,
      image:
        "https://images.unsplash.com/photo-1605647540924-852290f6b0da?w=800&auto=format&fit=crop",
      materials: ["Metal", "Other"],
      tags: ["pooja", "thali", "festival"],
    },
    {
      name: "Incense Sticks Pack (12 boxes)",
      description:
        "Fragrant incense sticks — sandal and rose blend. Long burning, for daily pooja use.",
      price: 120,
      stock: 70,
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop",
      materials: ["Other"],
      tags: ["pooja", "incense", "agarbatti"],
    },
  ],
  bags: [
    {
      name: "Casual Backpack – School & Travel",
      description:
        "Spacious casual backpack with multiple compartments. Water-resistant fabric, padded straps.",
      price: 699,
      stock: 32,
      image:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop",
      materials: ["Synthetic"],
      tags: ["bag", "backpack", "school"],
      freeShipping: true,
    },
    {
      name: "Ladies Sling Bag",
      description:
        "Compact sling bag for daily use. Adjustable strap, inner zip pocket, stylish design.",
      price: 399,
      stock: 38,
      image:
        "https://images.unsplash.com/photo-1590874103328-eac27a8142af?w=800&auto=format&fit=crop",
      materials: ["Synthetic"],
      tags: ["bag", "sling", "ladies"],
      isNewArrival: true,
    },
  ],
};

const defaultDimensions = {
  length: 20,
  width: 15,
  height: 8,
  weight: 0.35,
};

function buildProductDoc(item, categoryId, categorySlug, index) {
  const slug = `${categorySlug}-${item.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}-${index + 1}`;

  const offerFrom = new Date();
  const offerTill = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  return {
    productType: "simple",
    name: item.name,
    description: item.description,
    price: item.price,
    stock: item.stock,
    images: [{ url: item.image, id: slug }],
    brand: "Shree Laxmi Shop",
    category: categoryId,
    discount: item.discount || 0,
    offerTitle: item.discount ? "Special Offer" : undefined,
    offerDescription: item.discount ? "Limited time discount" : undefined,
    offerValidFrom: item.discount ? offerFrom : undefined,
    offerValidTill: item.discount ? offerTill : undefined,
    isFeatured: item.isFeatured || false,
    isNewArrival: item.isNewArrival || false,
    isBestSeller: item.isBestSeller || false,
    freeShipping: item.freeShipping || false,
    dimensions: item.dimensions || defaultDimensions,
    materials: item.materials || ["Other"],
    ageGroup: item.ageGroup || [],
    tags: item.tags || [categorySlug],
    keywords: [item.name, categorySlug, "shree laxmi shop"],
    slug,
  };
}

async function ensureCategories() {
  const map = {};
  for (const cat of CATEGORIES) {
    const doc = await Category.findOneAndUpdate(
      { slug: cat.slug },
      { name: cat.name, slug: cat.slug, isActive: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    map[cat.slug] = doc._id;
    console.log(`  ✓ Category: ${cat.name} (${cat.slug})`);
  }
  return map;
}

async function seedAllCategoryProducts() {
  const uri = process.env.MONGO_URI || process.env.MONGO_URL;
  if (!uri) {
    console.error("❌ Set MONGO_URI in server/.env");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected\n");

    console.log("📁 Ensuring categories...");
    const categoryMap = await ensureCategories();

    const deleted = await Product.deleteMany({});
    console.log(`\n🗑️  Deleted ${deleted.deletedCount} old products\n`);

    const allProducts = [];

    for (const cat of CATEGORIES) {
      const categoryId = categoryMap[cat.slug];
      const items = CATEGORY_PRODUCTS[cat.slug];

      if (!items || items.length < PRODUCTS_PER_CATEGORY) {
        console.warn(`⚠️  No product data for slug: ${cat.slug}`);
        continue;
      }

      items.slice(0, PRODUCTS_PER_CATEGORY).forEach((item, index) => {
        allProducts.push(buildProductDoc(item, categoryId, cat.slug, index));
      });

      console.log(`  📦 ${cat.name}: ${Math.min(items.length, PRODUCTS_PER_CATEGORY)} products queued`);
    }

    const inserted = await Product.insertMany(allProducts, { ordered: true });
    console.log(`\n✅ Inserted ${inserted.length} products total`);
    console.log(`   (${CATEGORIES.length} categories × ${PRODUCTS_PER_CATEGORY} products each)\n`);

    await mongoose.connection.close();
    console.log("🔌 Done.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeder failed:", error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

if (require.main === module) {
  seedAllCategoryProducts();
}

module.exports = seedAllCategoryProducts;
