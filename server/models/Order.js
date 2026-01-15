const mongoose = require("mongoose");

/* =========================
   ORDER ITEM (SNAPSHOT)
========================= */
const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: { type: String, required: true },
    image: String,

    price: Number,
    discountPercent: Number,
    discountAmount: Number,
    finalPrice: Number,

    quantity: Number,
    lineTotal: Number,

    // Dimensions snapshot (required for shipping)
    weight: { type: Number, required: true }, // kg
    length: { type: Number, required: true }, // cm
    width: { type: Number, required: true },
    height: { type: Number, required: true },

    color: String,
    size: String,
  },
  { _id: false }
);

/* =========================
   ORDER SCHEMA (BUSINESS)
========================= */
const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, sparse: true },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: { type: [orderItemSchema], required: true },

    /* 💰 AMOUNTS */
    subtotal: { type: Number, required: true },
    shippingCharge: { type: Number, default: 0 }, // estimated
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    /* 📍 ADDRESS SNAPSHOT */
    shippingAddress: {
      name: String,
      phone: String,
      email: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      pincode: String,
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

    /* 🧾 BUSINESS STATUS */
    orderStatus: {
      type: String,
      enum: ["PLACED", "CONFIRMED", "CANCELLED", "REFUNDED"],
      default: "PLACED",
    },

    /* 🚚 SHIPPING STATUS */
    shippingStatus: {
      type: String,
      enum: [
        "NOT_CREATED",
        "SHIPMENT_CREATED",
        "COURIER_ASSIGNED",
        "PICKED_UP",
        "IN_TRANSIT",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "RTO",
      ],
      default: "NOT_CREATED",
    },

    currentShipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shipment",
    },
    shiprocketOrderId: {
      type: String,
      index: true,
    },

    statusHistory: [
      {
        orderStatus: String,
        shippingStatus: String,
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        changedAt: { type: Date, default: Date.now },
        reason: String,
      },
    ],

    cancelReason: String,
    deliveredAt: Date,
  },
  { timestamps: true }
);

// Schema ke baad, model banane se pehle
orderSchema.pre("save", async function (next) {
  if (this.isNew && !this.orderNumber) {
    try {
      // Format: SIS-YYYYMMDD-XXXXX
      const date = new Date();
      const dateStr =
        date.getFullYear().toString() +
        (date.getMonth() + 1).toString().padStart(2, "0") +
        date.getDate().toString().padStart(2, "0");

      // Get today's order count
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const todaysOrders = await mongoose.model("Order").countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      });

      const sequence = (todaysOrders + 1).toString().padStart(4, "0");
      this.orderNumber = `SIS-${dateStr}-${sequence}`;
    } catch (error) {
      // Fallback
      this.orderNumber = `SIS-${Date.now().toString().slice(-9)}`;
    }
  }
  next();
});
module.exports = mongoose.model("Order", orderSchema);
