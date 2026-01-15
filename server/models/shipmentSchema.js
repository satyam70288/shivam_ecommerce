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
    },

    provider: { type: String, default: "Shiprocket" },

    shiprocketOrderId: String,
    awb: String,
    courier: String,

    pickupDate: Date,
    deliveredAt: Date,

    trackingUrl: String,

    shippingStatus: {
      type: String,
      enum: [
        "SHIPMENT_CREATED",
        "COURIER_ASSIGNED",
        "PICKED_UP",
        "IN_TRANSIT",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "RTO",
      ],
    },

    estimatedCharge: Number,
    finalCharge: Number,
    extraCharge: Number,
    refundAmount: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shipment", shipmentSchema);
