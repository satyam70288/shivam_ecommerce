const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  amount: { type: Number, required: true },
  shippingCharge: { type: Number, default: 0 },

  shippingAddress: {
    name: String,
    phone: String,
    email: String,
    address_line1: String,
    address_line2: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: "India" },
  },

  paymentMode: {
    type: String,
    enum: ["Razorpay", "COD"],
    required: true,
  },

  isPaid: { type: Boolean, default: false },

  razorpay: {
    orderId: String,
    paymentId: String,
    signature: String,
  },

  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    variantId: mongoose.Schema.Types.ObjectId,
    name: String,
    price: Number,
    quantity: Number,
    color: String,
    size: String,
    weight: { type: Number, default: 0 },
  }],

  status: {
    type: String,
    enum: [
      "pending",
      "confirmed",
      "packed",
      "in_transit",
      "delivered",
      "cancelled",
      "returned",
      "failed",
    ],
    default: "pending",
  },

  shiprocketOrderId: String,
  awbCode: String,
  courierName: String,
  estimatedDelivery: String,

}, { timestamps: true });


module.exports = mongoose.model("Order", orderSchema);
