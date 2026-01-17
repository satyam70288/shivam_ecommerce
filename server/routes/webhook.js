// routes/webhook.js
const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const shipmentSchema = require("../models/shipmentSchema");

router.post("/shiprocket", async (req, res) => {
  try {
    const token = req.headers["x-api-key"];

    if (token !== process.env.SHIPROCKET_WEBHOOK_SECRET) {
      return res.status(401).send("Unauthorized");
    }

    const data = req.body;
    console.log("Shiprocket Webhook:", data);

    await shipmentSchema.findOneAndUpdate(
      { shiprocketOrderId: data.order_id },
      {
        awb: data.awb,
        courier: data.courier_name,
        trackingUrl: data.tracking_url,
        shippingStatus: data.current_status,
        $push: {
          statusHistory: {
            status: data.current_status,
            source: "shiprocket",
            remark: "Webhook update",
          },
        },
      }
    );

    res.status(200).send("OK");
  } catch (err) {
    console.error("Webhook Error:", err);
    res.status(500).send("Error");
  }
});



router.post("/shiprocket-webhook", async (req, res) => {
  try {
    const { order_id, shipment_status } = req.body;
    const order = await Order.findOne({ shiprocketId: order_id });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const statusMap = {
      Created: "pending",
      Packed: "packed",
      Shipped: "in_transit",
      Delivered: "delivered",
      Cancelled: "cancelled",
    };

    if (statusMap[shipment_status]) {
      order.status = statusMap[shipment_status];
      await order.save();
    }

    return res.status(200).json({ success: true, message: "Order status updated" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
