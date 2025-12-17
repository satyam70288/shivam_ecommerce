const mongoose = require("mongoose");

/* =========================
   ORDER ITEM (SNAPSHOT)
========================= */
const orderItemSchema = new mongoose.Schema(
  {
    // Reference (analytics / admin only)
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    // SNAPSHOT DATA (IMMUTABLE)
    name: { type: String, required: true },
    sku: { type: String },
    image: { type: String },

    price: { type: Number, required: true },        // original price
    discount: { type: Number, default: 0 },          // % at order time
    finalPrice: { type: Number, required: true },    // after discount

    quantity: { type: Number, required: true, min: 1 },

    // Variant snapshot (optional but useful)
    color: String,
    size: String,
    weight: { type: Number, default: 0 },
  },
  { _id: false }
);

/* =========================
   ORDER SCHEMA
========================= */
const orderSchema = new mongoose.Schema(
  {
    /* 👤 USER */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /* 📦 ITEMS */
    items: {
      type: [orderItemSchema],
      required: true,
    },

    /* 💰 AMOUNTS (CLEAR ACCOUNTING) */
    subtotal: { type: Number, required: true },
    shippingCharge: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    /* 📍 SHIPPING ADDRESS (SNAPSHOT) */
    shippingAddress: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: String,
      addressLine1: { type: String, required: true },
      addressLine2: String,
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, default: "India" },
    },

    /* 💳 PAYMENT */
    paymentMethod: {
      type: String,
      enum: ["COD", "RAZORPAY", "CARD", "UPI", "NETBANKING"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING",
    },

    paymentGateway: {
      orderId: String,
      paymentId: String,
      signature: String,
    },

    /* 🚚 ORDER STATUS */
    status: {
      type: String,
      enum: [
        "PLACED",
        "CONFIRMED",
        "PACKED",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
        "RETURNED",
      ],
      default: "PLACED",
    },

    /* 🚛 SHIPPING / COURIER (OPTIONAL INTEGRATION) */
    shippingProvider: String,          // Shiprocket, Delhivery, etc
    shippingOrderId: String,
    awbCode: String,
    courierName: String,
    estimatedDelivery: Date,

    /* 🔁 META */
    cancelReason: String,
    deliveredAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
