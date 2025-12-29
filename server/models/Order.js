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

    // 🔥 DIMENSIONS SNAPSHOT (REQUIRED)
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
   ORDER SCHEMA
========================= */
const orderSchema = new mongoose.Schema(
  {

    orderNumber: {
      type: String,
      unique: true,
      sparse: true, // Allow null for old orders
    },
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
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reason: String,
      },
    ],
    /* 🚛 SHIPPING / COURIER (OPTIONAL INTEGRATION) */
    shippingProvider: String, // Shiprocket, Delhivery, etc
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
// Schema ke baad, model banane se pehle
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    try {
      // Format: SIS-YYYYMMDD-XXXXX
      const date = new Date();
      const dateStr = date.getFullYear().toString() + 
                     (date.getMonth() + 1).toString().padStart(2, '0') + 
                     date.getDate().toString().padStart(2, '0');
      
      // Get today's order count
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      
      const todaysOrders = await mongoose.model('Order').countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      });
      
      const sequence = (todaysOrders + 1).toString().padStart(4, '0');
      this.orderNumber = `SIS-${dateStr}-${sequence}`;
      
    } catch (error) {
      // Fallback
      this.orderNumber = `SIS-${Date.now().toString().slice(-9)}`;
    }
  }
  next();
});
module.exports = mongoose.model("Order", orderSchema);
