const axios = require("axios");
const getShiprocketToken = require("../helper/shiprocket");
const shipmentSchema = require("../models/shipmentSchema");
const Order = require("../models/Order");

const SHIPROCKET_BASE = "https://apiv2.shiprocket.in/v1/external";
const PICKUP_PINCODE = process.env.SHIPROCKET_PICKUP_PINCODE || "401404";

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

function pickTrackingUrl(awb, data = {}) {
  return (
    data.track_url ||
    data.tracking_url ||
    data.tracking_link ||
    (awb ? `https://shiprocket.co/tracking/${awb}` : null)
  );
}

/** Create order on Shiprocket + assign AWB + save shipment */
async function createShiprocketOrder(order) {
  const token = await getShiprocketToken();
  const orderDoc =
    order.shippingMeta?.courierId != null
      ? order
      : await Order.findById(order._id || order);

  if (!orderDoc) throw new Error("Order not found");

  if (!orderDoc.shippingMeta?.courierId) {
    throw new Error("Courier not locked on order — cannot create Shiprocket shipment");
  }

  const shiprocketOrder = await createAdhocOrderOnShiprocket(orderDoc, token);
  const srOrderId = shiprocketOrder.order_id;
  const srShipmentId = shiprocketOrder.shipment_id;

  if (!srShipmentId) {
    throw new Error("Shiprocket did not return shipment_id");
  }

  const awbData = await assignAWBOnShiprocket({
    token,
    shipmentId: srShipmentId,
    courierId: orderDoc.shippingMeta.courierId,
  });

  const awb =
    awbData.awb_code ||
    awbData.response?.data?.awb_code ||
    awbData.awb_assign_error?.awb_code;
  const courier =
    awbData.courier_name ||
    awbData.response?.data?.courier_name ||
    orderDoc.shippingMeta.courierName;

  let labelUrl = null;
  let invoiceUrl = null;

  try {
    labelUrl = await generateLabelUrl(token, srShipmentId);
  } catch (e) {
    console.warn("Shiprocket label generation:", e.message);
  }

  try {
    invoiceUrl = await generateInvoiceUrl(token, srOrderId);
  } catch (e) {
    console.warn("Shiprocket invoice generation:", e.message);
  }

  const shipment = await saveShipment(orderDoc, {
    shiprocketOrder,
    awb,
    courier,
    trackingUrl: pickTrackingUrl(awb, awbData),
    labelUrl,
    invoiceUrl,
  });

  await Order.findByIdAndUpdate(orderDoc._id, {
    shiprocketOrderId: String(srOrderId),
    status: orderDoc.status === "PLACED" ? "CONFIRMED" : orderDoc.status,
  });

  return shipment;
}

/** Assign AWB for existing shipment (admin retry) */
async function assignCourier(mongoOrderId) {
  const order = await Order.findById(mongoOrderId).populate("currentShipmentId");
  if (!order) throw new Error("Order not found");

  const token = await getShiprocketToken();
  let shipment = order.currentShipmentId;

  if (!shipment) {
    return createShiprocketOrder(order);
  }

  if (shipment.awb) {
    return shipment;
  }

  const srShipmentId = shipment.shiprocketShipmentId;
  if (!srShipmentId) {
    throw new Error("Shiprocket shipment id missing — recreate shipment");
  }

  const courierId = order.shippingMeta?.courierId;
  if (!courierId) throw new Error("No courier locked on order");

  const awbData = await assignAWBOnShiprocket({
    token,
    shipmentId: srShipmentId,
    courierId,
  });

  const awb =
    awbData.awb_code || awbData.response?.data?.awb_code;
  const courier = awbData.courier_name || shipment.courier;

  let labelUrl = shipment.labelUrl;
  let invoiceUrl = shipment.invoiceUrl;

  if (!labelUrl) {
    try {
      labelUrl = await generateLabelUrl(token, srShipmentId);
    } catch (e) {
      console.warn("Label:", e.message);
    }
  }
  if (!invoiceUrl && shipment.shiprocketOrderId) {
    try {
      invoiceUrl = await generateInvoiceUrl(token, shipment.shiprocketOrderId);
    } catch (e) {
      console.warn("Invoice:", e.message);
    }
  }

  shipment.awb = awb;
  shipment.courier = courier;
  shipment.trackingUrl = pickTrackingUrl(awb, awbData);
  shipment.labelUrl = labelUrl;
  shipment.invoiceUrl = invoiceUrl;
  shipment.shippingStatus = "COURIER_ASSIGNED";
  shipment.statusHistory.push({
    status: "COURIER_ASSIGNED",
    source: "shiprocket",
    remark: "AWB assigned via API",
  });
  await shipment.save();

  return shipment;
}

async function createAdhocOrderOnShiprocket(order, token) {
  const fullName = (order.shippingAddress?.name || "Customer").trim();
  const parts = fullName.split(" ");
  const firstName = parts[0];
  const lastName = parts.slice(1).join(" ") || "Customer";

  const items = order.items || [];
  const totalWeight = Math.max(
    0.5,
    items.reduce((sum, item) => sum + (item.weight || 0.5) * item.quantity, 0)
  );

  const boxLength = Math.max(10, ...items.map((i) => i.length || 10));
  const boxWidth = Math.max(10, ...items.map((i) => i.width || 10));
  const boxHeight = Math.max(5, ...items.map((i) => i.height || 5));

  const payload = {
    order_id: order.orderNumber || order._id.toString(),
    order_date: new Date(order.createdAt || Date.now()).toISOString().split("T")[0],
    pickup_location: process.env.SHIPROCKET_PICKUP_NAME || "Primary",
    payment_method: order.paymentMethod === "COD" ? "COD" : "Prepaid",
    sub_total: order.subtotal,
    shipping_charges: order.shippingCharge || 0,
    ...(order.paymentMethod === "COD" && {
      cod_amount: order.totalAmount,
    }),
    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_phone: order.shippingAddress.phone,
    billing_email: order.shippingAddress.email || "noreply@shreelaxmishop.com",
    billing_address: order.shippingAddress.addressLine1,
    billing_address_2: order.shippingAddress.addressLine2 || "",
    billing_city: order.shippingAddress.city,
    billing_state: order.shippingAddress.state,
    billing_pincode: String(order.shippingAddress.pincode),
    billing_country: order.shippingAddress.country || "India",
    shipping_is_billing: true,
    order_items: items.map((item) => ({
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
    ...(order.shippingMeta?.courierId && {
      courier_id: order.shippingMeta.courierId,
    }),
  };

  const response = await axios.post(
    `${SHIPROCKET_BASE}/orders/create/adhoc`,
    payload,
    { headers: authHeaders(token) }
  );

  const data = response.data;
  if (data.status_code && data.status_code !== 1 && !data.order_id) {
    throw new Error(data.message || "Shiprocket order create failed");
  }
  return data;
}

async function assignAWBOnShiprocket({ token, shipmentId, courierId }) {
  const response = await axios.post(
    `${SHIPROCKET_BASE}/courier/assign/awb`,
    {
      shipment_id: Number(shipmentId),
      courier_id: Number(courierId),
    },
    { headers: authHeaders(token) }
  );
  return response.data;
}

async function generateLabelUrl(token, shipmentId) {
  const response = await axios.post(
    `${SHIPROCKET_BASE}/courier/generate/label`,
    { shipment_id: [Number(shipmentId)] },
    { headers: authHeaders(token) }
  );
  const data = response.data;
  return (
    data.label_url ||
    data.response?.label_url ||
    data[0]?.label_url ||
    null
  );
}

async function generateInvoiceUrl(token, shiprocketOrderId) {
  const response = await axios.post(
    `${SHIPROCKET_BASE}/orders/print/invoice`,
    { ids: [Number(shiprocketOrderId)] },
    { headers: authHeaders(token) }
  );
  const data = response.data;
  return (
    data.invoice_url ||
    data.response?.invoice_url ||
    data[0]?.invoice_url ||
    null
  );
}

async function trackByAwb(awb, token) {
  const t = token || (await getShiprocketToken());
  const response = await axios.get(
    `${SHIPROCKET_BASE}/courier/track/awb/${awb}`,
    { headers: { Authorization: `Bearer ${t}` } }
  );
  return response.data;
}

async function saveShipment(order, { shiprocketOrder, awb, courier, trackingUrl, labelUrl, invoiceUrl }) {
  const shipment = await shipmentSchema.create({
    orderId: order._id,
    provider: "Shiprocket",
    shiprocketOrderId: String(shiprocketOrder.order_id),
    shiprocketShipmentId: String(shiprocketOrder.shipment_id),
    awb: awb || null,
    courier: courier || null,
    trackingUrl: trackingUrl || null,
    labelUrl: labelUrl || null,
    invoiceUrl: invoiceUrl || null,
    shippingStatus: awb ? "COURIER_ASSIGNED" : "CREATED",
    charges: { estimated: order.shippingCharge },
    statusHistory: [
      {
        status: awb ? "COURIER_ASSIGNED" : "CREATED",
        source: "shiprocket",
        remark: awb ? "Order created with AWB on Shiprocket" : "Order created on Shiprocket",
      },
    ],
  });

  await Order.findByIdAndUpdate(order._id, {
    currentShipmentId: shipment._id,
    shiprocketOrderId: String(shiprocketOrder.order_id),
  });

  return shipment;
}

async function refreshLabelAndInvoice(mongoOrderId) {
  const order = await Order.findById(mongoOrderId).populate("currentShipmentId");
  if (!order?.currentShipmentId) throw new Error("No shipment for this order");

  const token = await getShiprocketToken();
  const shipment = order.currentShipmentId;

  if (shipment.shiprocketShipmentId) {
    shipment.labelUrl =
      (await generateLabelUrl(token, shipment.shiprocketShipmentId)) ||
      shipment.labelUrl;
  }
  if (shipment.shiprocketOrderId) {
    shipment.invoiceUrl =
      (await generateInvoiceUrl(token, shipment.shiprocketOrderId)) ||
      shipment.invoiceUrl;
  }
  await shipment.save();
  return shipment;
}

async function calculateShippingCharge({ deliveryPincode, totalWeight }) {
  const token = await getShiprocketToken();
  const weight = Math.max(0.5, totalWeight || 0.5);
  const pickup = process.env.SHIPROCKET_PICKUP_PINCODE || PICKUP_PINCODE;
  const url = `${SHIPROCKET_BASE}/courier/serviceability/?pickup_postcode=${pickup}&delivery_postcode=${deliveryPincode}&weight=${weight}&cod=0`;

  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = res.data?.data;
  if (!data?.available_courier_companies?.length) {
    throw new Error("Shipping not available for this pincode");
  }

  const couriers = data.available_courier_companies;
  const recommendedId =
    data.shiprocket_recommended_courier_id || data.recommended_courier_company_id;

  let selectedCourier = couriers.find(
    (c) => c.courier_company_id === recommendedId
  );

  if (!selectedCourier) {
    selectedCourier = couriers.reduce((cheapest, current) =>
      current.rate < cheapest.rate ? current : cheapest
    );
  }

  return {
    shippingCharge: Number(selectedCourier.rate),
    courierId: selectedCourier.courier_company_id,
    courierName: selectedCourier.courier_name,
    estimatedDelivery: selectedCourier.etd,
    deliveryDays: selectedCourier.estimated_delivery_days,
    isRecommended: selectedCourier.courier_company_id === recommendedId,
  };
}

module.exports = {
  createShiprocketOrder,
  assignCourier,
  calculateShippingCharge,
  generateLabelUrl,
  generateInvoiceUrl,
  trackByAwb,
  refreshLabelAndInvoice,
};
