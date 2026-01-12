const axios = require("axios");
const getShiprocketToken = require("../helper/shiprocket");

const createShiprocketOrder = async (order) => {
  const token = await getShiprocketToken();
  // 🔴 Calculate total weight
  const totalWeight = order.items.reduce(
    (sum, item) => sum + (item.weight || 0.5) * item.quantity, // ✅ Default weight if not available
    0
  );
  const boxLength = Math.max(...order.items.map((i) => i.length || 10));
  const boxWidth = Math.max(...order.items.map((i) => i.width || 10));
  const boxHeight = order.items.reduce((sum, i) => sum + (i.height || 5), 0);

  // 🔴 Payload mapping
  const payload = {
    order_id: order._id.toString(),
    order_date: order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    payment_method: order.paymentMethod === "COD" ? "COD" : "Prepaid",
    sub_total: order.subtotal,

    billing_customer_name: order.shippingAddress.name,
    billing_phone: order.shippingAddress.phone,
    billing_email: order.shippingAddress.email,
    billing_address: order.shippingAddress.addressLine1,
    billing_address_2: order.shippingAddress.addressLine2 || "",
    billing_city: order.shippingAddress.city,
    billing_state: order.shippingAddress.state,
    billing_pincode: order.shippingAddress.pincode.toString(),
    billing_country: order.shippingAddress.country || "India",

    shipping_is_billing: true,

    order_items: order.items.map((item) => ({
      name: item.name,
      units: item.quantity,
      selling_price: item.finalPrice || item.price,
      discount: item.discountAmount || 0,
      sku: item.sku || `SKU-${item.productId}`,
      hsn: item.hsn || "999999"
    })),

    // Package dimensions
    length: boxLength,
    breadth: boxWidth,
    height: boxHeight,
    weight: totalWeight || 0.5, // Minimum weight
  };

  try {
    // ✅ Store response in variable
    const response = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      }
    );

    const shiprocketResponse = response.data; // ✅ YEH LINE ADD KARO
    
    console.log("✅ Shiprocket response:", shiprocketResponse);

    // ✅ Now update database with shiprocketResponse
    await Order.findByIdAndUpdate(
      order._id,
      {
        shippingProvider: "Shiprocket",
        shippingOrderId: shiprocketResponse.order_id,
        awbCode: shiprocketResponse.awb_code || shiprocketResponse.shipment_id,
        courierName: shiprocketResponse.courier_name,
        estimatedDelivery: shiprocketResponse.estimated_delivery_date 
          ? new Date(shiprocketResponse.estimated_delivery_date)
          : new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Default 5 days
        trackingUrl: shiprocketResponse.tracking_url || shiprocketResponse.tracking_data?.tracking_url,
        shiprocketData: shiprocketResponse,
        status: "PROCESSING"
      }
    );

    console.log("✅ Database updated with Shiprocket details");

    // ✅ Generate AWB for prepaid orders
    if (order.paymentMethod !== "COD") {
      await generateAWB(order._id, shiprocketResponse.order_id);
    }

    return shiprocketResponse;

  } catch (error) {
    console.error("❌ Shiprocket order creation failed:", error.response?.data || error.message);
    
    // Mark order as failed in database
    await Order.findByIdAndUpdate(order._id, {
      status: "SHIPROCKET_FAILED",
      failureReason: error.response?.data?.message || error.message
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
    c => c.courier_company_id === recommendedId
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

module.exports = { createShiprocketOrder,calculateShippingCharge };
