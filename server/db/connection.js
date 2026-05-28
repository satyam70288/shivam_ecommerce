const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("MONGO_URI is not set in environment variables");
      process.exit(1);
    }

    const connection = await mongoose.connect(process.env.MONGO_URI);
    console.log(`DB connected to ${connection.connection.host}`);
  } catch (error) {
    console.error("Error connecting to database:", error.message);
    process.exit(1);
  }
};

module.exports = { connectDb };
