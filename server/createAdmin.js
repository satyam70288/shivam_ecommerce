// createAdmin.js — run: ADMIN_USERNAME=... ADMIN_PASSWORD=... node createAdmin.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Admin = require("./models/Admin");

async function createAdmin() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not set");
    }
    await mongoose.connect(process.env.MONGO_URI);

    const username = process.env.ADMIN_USERNAME || "superadmin";
    const plainPassword = process.env.ADMIN_PASSWORD;
    if (!plainPassword) {
      throw new Error("ADMIN_PASSWORD env variable is required");
    }

    const hashed = await bcrypt.hash(plainPassword, 10);

    const admin = await Admin.create({
      username,
      password: hashed,
      role: "admin",
    });

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createAdmin();
