const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        // Only for clothing (variant products)
        variantId: {
          type: mongoose.Schema.Types.ObjectId,
          required: false,
        },

        // optional color/size
        color: { type: String, required: false },
        size: { type: String, required: false },

        quantity: { type: Number, default: 1 },

        // freeze price at time of adding to cart
        price: { type: Number, required: true },

        // Optional image for cart display
        image: { type: String },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
