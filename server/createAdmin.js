// createAdmin.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Admin = require("./models/Admin");

async function createAdmin() {
  try {
    await mongoose.connect("mongodb+srv://satyamb971_db_user:mQkimJ4UeyRnldla@cluster0.ajggbjn.mongodb.net/");

    const hashed = await bcrypt.hash("divya@123", 10);

    const admin = await Admin.create({
      username: "superadmin",
      password: hashed,
      role: "admin",
    });

    console.log("Admin created:", admin);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createAdmin();
