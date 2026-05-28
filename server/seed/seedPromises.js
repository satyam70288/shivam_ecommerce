const mongoose = require("mongoose");
const PromiseMaster = require("../models/PromiseMaster");
require("dotenv").config();
const MONGO_URI = process.env.MONGO_URI; 
// ↑ apna DB name daalna

const promises = [
  {
    code: "READY_TO_SHIP",
    title: "Ready to Ship",
    description: "Dispatched as early as possible",
    iconId: "truck",
  },
  {
    code: "EASY_RETURNS",
    title: "Easy Returns",
    description: "Hassle-free returns within the return window",
    iconId: "refresh",
  },
  {
    code: "SECURE_PAYMENTS",
    title: "Secure Payments",
    description: "Multiple secure payment options available",
    iconId: "shield",
  },
  {
    code: "QUALITY_CHECKED",
    title: "Quality Checked",
    description: "Verified for quality before dispatch",
    iconId: "check",
  },
];

async function seedPromises() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    for (const promise of promises) {
      await PromiseMaster.updateOne(
        { code: promise.code },
        { $set: promise },
        { upsert: true } // 🔥 duplicate nahi banega
      );
    }

    console.log("✅ PromiseMaster seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedPromises();
