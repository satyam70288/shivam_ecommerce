const mongoose = require("mongoose");

const stateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    code: {
      type: String, // MH, DL, KA (optional but useful)
      trim: true,
      uppercase: true
    },

    country: {
      type: String,
      default: "India"
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("State", stateSchema);
