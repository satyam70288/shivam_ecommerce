const axios = require("axios");
const getShiprocketToken = require("../helper/shiprocket");
const shipmentSchema = require("../models/shipmentSchema");
const Order = require("../models/Order");

const pickupPincode = 401404;
async function createShiprocketOrder(order) {
  const token = await getShiprocketToken();

  if (!order.shippingMeta?.courierId) {
    throw new Error("Courier not locked in order");
  }

  // 1) Create order on Shiprocket
  const shiprocketOrder = await createAdhocOrderOnShiprocket(order, token);

  // 2) Assign locked courier
  // const courierData = await assignLockedCourier(
  //   shiprocketOrder.order_id,
  //   order.shippingMeta.courierId,
  //   token
  // );

  // 3) Save shipment in DB
  // const shipment = await saveShipment(order, shiprocketOrder, courierData);
  const shipment = await saveShipment(order, shiprocketOrder);

  return shipment;
}
async function createAdhocOrderOnShiprocket(order, token) {
  const fullName = order.shippingAddress.name.trim();
  const parts = fullName.split(" ");
  const firstName = parts[0];
  const lastName = parts.slice(1).join(" ") || "Customer";

  const totalWeight = order.items.reduce(
    (sum, item) => sum + item.weight * item.quantity,
    0
  );

  const boxLength = Math.max(...order.items.map((i) => i.length));
  const boxWidth = Math.max(...order.items.map((i) => i.width));
  const boxHeight = Math.max(...order.items.map((i) => i.height));

  const payload = {
    order_id: order._id.toString(),
    order_date: new Date(order.createdAt).toISOString().split("T")[0],
    payment_method: order.paymentMethod === "COD" ? "COD" : "Prepaid",
    sub_total: order.subtotal,
    shipping_charges: order.shippingCharge, // ₹72.6

    // ✅ LINE 2: COD AMOUNT (ONLY FOR COD)
    ...(order.paymentMethod === "COD" && {
      cod_amount: order.totalAmount, // ₹414.6
    }),
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

    order_items: order.items.map((item) => ({
      name: item.name,
      units: item.quantity,
      selling_price: item.finalPrice || item.price,
      discount: item.discountAmount || 0,
      sku: `SKU-${item.productId}`,
      hsn: "999999",
    })),

    length: boxLength,
    breadth: boxWidth,
    height: boxHeight,
    weight: totalWeight,

    auto_assign: false,
    is_pickup: false,
  };

  const response = await axios.post(
    "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
}
async function assignLockedCourier(orderId, courierId, token) {
  const response = await axios.post(
    "https://apiv2.shiprocket.in/v1/external/courier/assign",
    {
      order_id: orderId,
      courier_id: courierId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.data.awb_code) {
    throw new Error("Courier assignment failed");
  }

  return response.data;
}
async function saveShipment(order, shiprocketOrder) {
  const shipment = await shipmentSchema.create({
    orderId: order._id,
    provider: "Shiprocket",
    shiprocketOrderId: shiprocketOrder.order_id,
    // awb: courierData.awb_code,
    // courier: courierData.courier_name,
    // trackingUrl: courierData.tracking_url || null,
    shippingStatus: "COURIER_ASSIGNED",
    charges: {
      estimated: order.shippingCharge,
    },
    statusHistory: [
      {
        status: "COURIER_ASSIGNED",
        source: "shiprocket",
        remark: "Courier assigned",
      },
    ],
  });

  await Order.findByIdAndUpdate(order._id, {
    currentShipmentId: shipment._id,
  });

  return shipment;
}

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
    courierId: recommendedCourier.courier_company_id, // 🔥 MUST
    courierName: recommendedCourier.courier_name,
    estimatedDelivery: recommendedCourier.etd,
    deliveryDays: recommendedCourier.estimated_delivery_days,
    courierRating: recommendedCourier.rating,
  };
}
module.exports = {
  createShiprocketOrder,
  calculateShippingCharge,
  // assignCourier,
};
