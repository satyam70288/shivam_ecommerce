const mongoose = require("mongoose");

/* =========================
   SHIPMENT SCHEMA
========================= */
const shipmentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    provider: {
      type: String,
      default: "Shiprocket",
    },

    shiprocketOrderId: {
      type: String,
      index: true,
    },

    awb: {
      type: String,
      index: true,
    },

    courier: String,
    trackingUrl: String,

    pickupDate: Date,
    deliveredAt: Date,

    shippingStatus: {
      type: String,
      enum: [
        "CREATED",
        "PROCESSING", // ✅ MISSING
        "READY_TO_SHIP", // ✅ MISSING
        "PICKUP_SCHEDULED", // ✅ MISSING
        "PICKUP_GENERATED", // ✅ MISSING
        "PICKUP_QUEUED", // ✅ MISSING
        "MANIFEST_GENERATED", // ✅ MISSING
        "PICKED_UP", // ✅ ALREADY EXISTS
        "IN_TRANSIT", // ✅ ALREADY EXISTS
        "OUT_FOR_DELIVERY", // ✅ ALREADY EXISTS
        "DELIVERED", // ✅ ALREADY EXISTS
        "RTO", // ✅ ALREADY EXISTS
        "RTO_IN_TRANSIT", // ✅ MISSING
        "RTO_OUT_FOR_DELIVERY", // ✅ MISSING
        "RTO_DELIVERED", // ✅ MISSING
        "CANCELLED", // ✅ ALREADY EXISTS
        "LOST", // ✅ MISSING
        "DAMAGED", // ✅ MISSING
        "SHIPPED", // ✅ MISSING
      ],
      default: "CREATED",
    },

    charges: {
      estimated: Number,
      final: Number,
      extra: Number,
      refund: Number,
    },

    statusHistory: [
      {
        status: String,
        source: String, // shiprocket / system / admin
        at: { type: Date, default: Date.now },
        remark: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shipment", shipmentSchema);
