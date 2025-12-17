// models/ProductCapabilities.js
const mongoose = require("mongoose");

const productCapabilitiesSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: false,
      index: true,
    },

    canDispatchFast: {
      type: Boolean,
      default: false,
    },

    returnEligible: {
      type: Boolean,
      default: false,
    },

    codAvailable: {
      type: Boolean,
      default: false,
    },

    qualityVerified: {
      type: Boolean,
      default: false,
    },

    computedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "ProductCapabilities",
  productCapabilitiesSchema
);
