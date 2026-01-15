const axios = require("axios");
const getShiprocketToken = require("../helper/shiprocket");
const shipmentSchema = require("../models/shipmentSchema");
const Order = require("../models/Order");


const createShiprocketOrder = async (order) => {
  const token = await getShiprocketToken();

  /* ============ BASIC VALIDATION ============ */

  if (!order.shippingAddress?.name) {
    throw new Error("Customer name missing");
  }

  const fullName = order.shippingAddress.name.trim();
  const nameParts = fullName.split(" ");

  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ") || "Customer";

  if (!order.shippingAddress.phone || !order.shippingAddress.pincode) {
    throw new Error("Incomplete shipping address");
  }

  /* ============ WEIGHT CALCULATION ============ */

  const totalWeight = order.items.reduce(
    (sum, item) => sum + (item.weight || 0.5) * item.quantity,
    0
  );

  const boxLength = Math.max(...order.items.map(i => i.length || 10));
  const boxWidth  = Math.max(...order.items.map(i => i.width || 10));
  const boxHeight = order.items.reduce((sum, i) => sum + (i.height || 5), 0);

  /* ============ PAYLOAD ============ */

  const payload = {
    order_id: order._id.toString(),
    order_date: new Date(order.createdAt).toISOString().split("T")[0],
    payment_method: order.paymentMethod === "COD" ? "COD" : "Prepaid",
    sub_total: order.subtotal,

    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_phone: order.shippingAddress.phone,
    billing_email: order.shippingAddress.email || "noreply@example.com",
    billing_address: order.shippingAddress.addressLine1,
    billing_address_2: order.shippingAddress.addressLine2 || "",
    billing_city: order.shippingAddress.city,
    billing_state: order.shippingAddress.state,
    billing_pincode: String(order.shippingAddress.pincode),
    billing_country: order.shippingAddress.country || "India",

    shipping_is_billing: true,

    order_items: order.items.map(item => ({
      name: item.name,
      units: item.quantity,
      selling_price: item.finalPrice || item.price,
      discount: item.discountAmount || 0,
      sku: item.sku || `SKU-${item.productId}`,
      hsn: item.hsn || "999999",
    })),

    length: boxLength,
    breadth: boxWidth,
    height: boxHeight,
    weight: totalWeight || 0.5,
  };

  /* ============ SHIPPING MODE ============ */

  if (order.paymentMethod === "COD") {
    payload.is_pickup = 0;
    payload.auto_assign = 0;
  } else {
    payload.is_pickup = 1;
    payload.auto_assign = 1;
  }

  /* ============ API CALL ============ */

  try {
    const response = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    const shiprocketResponse = response.data;

    console.log("✅ Shiprocket order created:", shiprocketResponse);

    /* ============ SAVE SHIPMENT ============ */

    const shipment = await shipmentSchema.create({
      orderId: order._id,
      provider: "Shiprocket",
      shiprocketOrderId: shiprocketResponse.order_id,
      awb: shiprocketResponse.awb_code || null,
      courier: shiprocketResponse.courier_name || null,
      trackingUrl: shiprocketResponse.tracking_url || null,
      shippingStatus: payload.auto_assign
        ? "COURIER_ASSIGNED"
        : "SHIPMENT_CREATED",
      estimatedCharge: order.shippingCharge,
      rawResponse: shiprocketResponse
    });

    await Order.findByIdAndUpdate(order._id, {
      shiprocketOrderId: shiprocketResponse.order_id,
      shippingStatus: shipment.shippingStatus,
      currentShipmentId: shipment._id,
    });

    return shiprocketResponse;

  } catch (error) {
    console.error("❌ Shiprocket error:", error.response?.data || error.message);

    await Order.findByIdAndUpdate(order._id, {
      shippingStatus: "SHIPMENT_FAILED",
      shipmentError: error.response?.data || error.message,
    });

    throw error;
  }
};


// async function calculateShippingCharge({ deliveryPincode, totalWeight }) {
//   const token = await getShiprocketToken();

//   const url = `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=${400053}&delivery_postcode=${deliveryPincode}&weight=${totalWeight}&cod=0`;

//   const res = await axios.get(url, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });
// console.log(res.data.data)
//   const couriers = res.data?.data?.available_courier_companies;

//   if (!couriers || couriers.length === 0) {
//     throw new Error("Shipping not available for this pincode");
//   }
// // India Post को exclude करने के लिए
// const EXCLUDED_COURIERS = ['India Post', 'Speed Post', 'Business Parcel'];

// const filteredCouriers = couriers.filter(courier =>
//   !EXCLUDED_COURIERS.some(excluded =>
//     courier.courier_name.includes(excluded)
//   )
// );
//   // Cheapest courier choose karo
//   filteredCouriers.sort((a, b) => a.rate - b.rate);
//   const cheapest = couriers[0];

//   return {
//     shippingCharge: Number(cheapest.rate),
//     courierName: cheapest.courier_name,
//     estimatedDelivery: cheapest.etd,
//   };
// }

async function calculateShippingCharge({ deliveryPincode, totalWeight }) {
  const token = await getShiprocketToken();

  const url = `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=400053&delivery_postcode=${deliveryPincode}&weight=${totalWeight}&cod=0`;

  const res = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = res.data?.data;

  if (!data || !data.available_courier_companies?.length) {
    throw new Error("Shipping not available for this pincode");
  }

  const couriers = data.available_courier_companies;

  // ✅ Shiprocket recommended courier ID
  const recommendedId =
    data.shiprocket_recommended_courier_id ||
    data.recommended_courier_company_id;

  // ✅ Find recommended courier
  const recommendedCourier = couriers.find(
    (c) => c.courier_company_id === recommendedId
  );

  if (!recommendedCourier) {
    throw new Error("Recommended courier not found");
  }

  return {
    shippingCharge: Number(recommendedCourier.rate),
    courierName: recommendedCourier.courier_name,
    estimatedDelivery: recommendedCourier.etd,
    deliveryDays: recommendedCourier.estimated_delivery_days,
    courierRating: recommendedCourier.rating,
  };
}
const assignCourier = async (orderId) => {
  const order = await Order.findById(orderId);

  if (!order) throw new Error("Order not found");

  if (!order.shiprocketOrderId) {
    throw new Error("Shiprocket order not created yet");
  }

  if (order.shippingStatus === "COURIER_ASSIGNED") {
    throw new Error("Courier already assigned");
  }

  const token = await getShiprocketToken();

  // ✅ Send Shiprocket Order ID (not Mongo ID)
  const response = await axios.post(
    "https://apiv2.shiprocket.in/v1/external/courier/assign/awb",
    {
      order_id: order.shiprocketOrderId
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    }
  );

  const data = response.data;

  if (!data.awb_code) {
    throw new Error("Courier assignment failed");
  }

  // ✅ Update Shipment
  await Shipment.findOneAndUpdate(
    { orderId: order._id },
    {
      awb: data.awb_code,
      courier: data.courier_name,
      shippingStatus: "COURIER_ASSIGNED"
    }
  );

  // ✅ Update Order
  await Order.findByIdAndUpdate(orderId, {
    shippingStatus: "COURIER_ASSIGNED"
  });

  return data;
};



module.exports = {
  createShiprocketOrder,
  calculateShippingCharge,
  assignCourier,
};
