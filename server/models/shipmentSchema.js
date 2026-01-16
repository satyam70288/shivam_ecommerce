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
        "COURIER_ASSIGNED", // ✅ add this
        "PROCESSING",
        "READY_TO_SHIP",
        "PICKUP_SCHEDULED",
        "PICKUP_GENERATED",
        "PICKUP_QUEUED",
        "MANIFEST_GENERATED",
        "PICKED_UP",
        "IN_TRANSIT",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "RTO",
        "RTO_IN_TRANSIT",
        "RTO_OUT_FOR_DELIVERY",
        "RTO_DELIVERED",
        "CANCELLED",
        "LOST",
        "DAMAGED",
        "SHIPPED",
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
