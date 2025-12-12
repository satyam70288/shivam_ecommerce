const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },

    // FINAL SHIPPING CHARGE from Shiprocket
    shippingCharge: { type: Number, required: true },

    // Courier Details (from Shiprocket)
    courierName: { type: String, default: null },
    awbCode: { type: String, default: null }, // airway bill number
    estimatedDelivery: { type: String, default: null },

    // Address
    address: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zip: { type: String, required: true },
      country: { type: String, default: "India" },
    },

    paymentMode: {
      type: String,
      enum: ["Razorpay", "COD"],
      default: "Razorpay",
    },
    isPaid: { type: Boolean, default: false },

    // Shiprocket
    shiprocketOrderId: { type: String, default: null },
    courierTrackingId: { type: String, default: null },

    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        variantId: {
          type: mongoose.Schema.Types.ObjectId,
          required: false,
        },

        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },

        // for variant products
        color: { type: String, required: false },
        size: { type: String, required: false },

        // per-product weight copied from Product model
        weight: { type: Number, required: false },
      },
    ],

    status: {
      type: String,
      enum: [
        "pending",
        "packed",
        "in_transit",
        "delivered",
        "cancelled",
        "exchanged",
        "returned",
        "failed",
      ],
      default: "pending",
    },

    isCancelled: { type: Boolean, default: false },
    cancelledAt: Date,
    cancelReason: String,

    isExchanged: { type: Boolean, default: false },
    exchangedAt: Date,
    exchangeReason: String,

    isReturned: { type: Boolean, default: false },
    returnedAt: Date,
    returnReason: String,

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
