// controllers/shiprocketController.js
const axios = require("axios");
const Order = require("../models/Order");
const getShiprocketToken = require("../utils/shiprocket"); // Function to get auth token

/**
 * Create a shipment in Shiprocket for the given order ID
 * @param {String} orderId - MongoDB Order ID
 * @returns {Object} - Updated order with shiprocketId
 */
const createShipment = async (orderId) => {
  const order = await Order.findById(orderId);
  console.log(order, "Order for shipment");
  if (!order) throw new Error("Order not found");

  // 1️⃣ Get Shiprocket authentication token
  const token = await getShiprocketToken();

  const addr = order.address;
  if (
    !addr.name ||
    !addr.phone ||
    !addr.street ||
    !addr.city ||
    !addr.state ||
    !addr.zip
  ) {
    throw new Error("Incomplete address for shipment");
  }

  const orderDate = new Date().toISOString().replace("T", " ").slice(0, 16);

  const payload = {
    order_id: `order_${order._id}`, // better unique ID
    order_date: orderDate,
    pickup_location: "Home",
    channel_id: 7722014,

    // Billing
    billing_customer_name: "Varun Tare",
    billing_last_name: "",
    billing_address: "23, T-251, Cidco colony, Boisar, palghar, Maharashtra",
    billing_city: "Boisar",
    billing_pincode: "401501",
    billing_state: "Maharashtra",
    billing_country: "India",
    billing_email: "varuntare2@gmail.com",
    billing_phone: "9702447092",

    shipping_is_billing: true,

    // Items
    order_items: [
      {
        name: "Macaw Sunflower - L Blue",
        sku: "TSHIRT001",
        units: 1,
        selling_price: 439,
        discount: 0,
        tax: 0,
        hsn: "",
      },
    ],

    payment_method: "COD",
    sub_total: 439,
    length: 10,
    breadth: 10,
    height: 2,
    weight: 0.5,
  };

  console.log("🚀 Shiprocket payload:", JSON.stringify(payload, null, 2));

  try {
    const res = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Shiprocket response:", res.data);

    if (res.data && res.data.status_code === 1) {
      order.shiprocketId = res.data.order_id;
      order.shipmentId = res.data.shipment_id;
      await order.save();
      return order;
    } else {
      throw new Error(
        `Shiprocket order create failed: ${JSON.stringify(res.data)}`
      );
    }
  } catch (err) {
    console.error(
      "❌ Shiprocket API error:",
      err.response?.data || err.message
    );
    throw err;
  }
};

module.exports = { createShipment };
