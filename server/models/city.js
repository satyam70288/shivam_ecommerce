const mongoose = require("mongoose");

const citySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "State",
      required: true
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Index for fast lookup by state
citySchema.index({ state: 1 });

// Prevent duplicate city names within same state
citySchema.index({ name: 1, state: 1 }, { unique: true });

module.exports = mongoose.model("City", citySchema);
