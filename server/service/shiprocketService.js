const axios = require("axios");
const getShiprocketToken = require("../helper/shiprocket");


const createShiprocketOrder = async (order) => {
  const token = await getShiprocketToken();

  // 🔴 Calculate total weight
  const totalWeight = order.items.reduce(
    (sum, item) => sum + item.weight * item.quantity,
    0
  );

  // 🔴 Payload mapping
  const payload = {
    order_id: order._id.toString(),
    order_date: order.createdAt,
    payment_method: order.paymentMethod === "COD" ? "COD" : "Prepaid",
    sub_total: order.subtotal,

    billing_customer_name: order.shippingAddress.name,
    billing_phone: order.shippingAddress.phone,
    billing_email: order.shippingAddress.email,
    billing_address: order.shippingAddress.addressLine1,
    billing_address_2: order.shippingAddress.addressLine2,
    billing_city: order.shippingAddress.city,
    billing_state: order.shippingAddress.state,
    billing_pincode: order.shippingAddress.pincode,
    billing_country: order.shippingAddress.country || "India",

    shipping_is_billing: true,

    order_items: order.items.map((item) => ({
      name: item.name,
      units: item.quantity,
      selling_price: item.finalPrice,
      discount: item.discountAmount,
    })),

    // Package dimensions (simple-product assumption)
    length: order.items[0].length,
    breadth: order.items[0].width,
    height: order.items[0].height,
    weight: totalWeight,
  };

  try {
    const res = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data;
  } catch (err) {
    console.error(
      "Shiprocket Order Create Error:",
      err.response?.data || err.message
    );
    throw new Error("Failed to create Shiprocket order");
  }
};

module.exports = { createShiprocketOrder };
