// controllers/paymentController.js
const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const Address = require("../models/address");
const { calculateOrder } = require("../helper/createOrder");
const { default: mongoose } = require("mongoose");
const {
  createShiprocketOrder,
  calculateShippingCharge,
} = require("../service/shiprocketService");

const updateOrderStatusWithHistory = async (
  orderId,
  newStatus,
  changedBy,
  reason
) => {
  await Order.findByIdAndUpdate(orderId, {
    $push: {
      statusHistory: {
        status: newStatus,
        changedAt: new Date(),
        changedBy: changedBy,
        reason: reason,
      },
    },
    status: newStatus,
  });
};
exports.createRazorpayOrder = async (req, res) => {
  try {
    const userId = req.id;
    const { productId, quantity, addressId } = req.body;

    /* ================= BASIC VALIDATION ================= */
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!addressId) {
      return res.status(400).json({ message: "Address is required" });
    }

    const addressDoc = await Address.findById(addressId);
    if (!addressDoc) {
      return res.status(400).json({ message: "Address not found" });
    }

    if (String(addressDoc.userId) !== String(userId)) {
      return res.status(403).json({ message: "Address does not belong to you" });
    }

    /* ================= SERVER-SIDE PRICE CALC WITH ADDRESS ================= */
    const orderData = await calculateOrder(
      userId,
      { productId, quantity },
      addressDoc
    );

    if (
      !orderData ||
      !orderData.summary ||
      typeof orderData.summary.total !== "number"
    ) {
      return res.status(400).json({
        message: "Invalid order calculation",
      });
    }

    if (orderData.summary.total <= 0) {
      return res.status(400).json({
        message: "Order amount must be greater than zero",
      });
    }

    /* ================= RAZORPAY AMOUNT ================= */
    const amountInPaise = Math.round(orderData.summary.total * 100);

    /* ================= CREATE RAZORPAY ORDER ================= */
    const rpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}_${userId.slice(-5)}`,
      notes: {
        userId,
        checkoutType: orderData.checkoutType,
        addressId,
        pincode: addressDoc.pincode, // ✅ For reference
      },
    });

    /* ================= SUCCESS RESPONSE ================= */
    return res.status(200).json({
      success: true,
      razorpayOrderId: rpOrder.id,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
      orderSummary: orderData.summary, // ✅ Now includes shipping charge
    });
  } catch (error) {
    console.error("Create Razorpay Order failed:", error.message);
    return res.status(500).json({
      message: "Failed to initiate payment",
    });
  }
};
exports.verifyRazorpayPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.id;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      productId,
      quantity,
      addressId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new Error("Missing payment details");
    }

    // ✅ Signature verify
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      throw new Error("Invalid payment signature");
    }

    // ✅ Idempotency
    const existingOrder = await Order.findOne(
      { "paymentGateway.paymentId": razorpay_payment_id },
      null,
      { session }
    );

    if (existingOrder) {
      await session.commitTransaction();
      session.endSession();
      return res.json({ success: true, orderId: existingOrder._id });
    }

    const addressDoc = await Address.findById(addressId).session(session);
    if (!addressDoc) throw new Error("Invalid address");
    if (String(addressDoc.userId) !== String(userId)) {
      throw new Error("Address does not belong to you");
    }

    const orderData = await calculateOrder(
      userId,
      { productId, quantity },
      addressDoc
    );

    let shippingInfo = orderData.summary.shippingInfo;
    if (!shippingInfo?.courierId && addressDoc.pincode && orderData.summary.totalWeight > 0) {
      try {
        shippingInfo = await calculateShippingCharge({
          deliveryPincode: addressDoc.pincode,
          totalWeight: orderData.summary.totalWeight,
        });
      } catch (e) {
        /* courier optional for order; Shiprocket may still fail later */
      }
    }

    const shippingMeta =
      shippingInfo?.courierId != null
        ? {
            courierId: shippingInfo.courierId,
            courierName: shippingInfo.courierName,
            estimatedDelivery: shippingInfo.estimatedDelivery,
          }
        : undefined;

    // ✅ Amount verify
    const rpOrder = await razorpay.orders.fetch(razorpay_order_id);
    const expectedAmount = Math.round(orderData.summary.total * 100);

    if (rpOrder.amount !== expectedAmount) {
      throw new Error(`Payment amount mismatch. Expected: ₹${orderData.summary.total}, Got: ₹${rpOrder.amount/100}`);
    }

    // ✅ Shipping address snapshot
    const shippingAddress = {
      name: addressDoc.name,
      phone: addressDoc.phone,
      email: addressDoc.email,
      addressLine1: addressDoc.address_line1,
      addressLine2: addressDoc.address_line2 || "",
      city: addressDoc.city,
      state: addressDoc.state,
      pincode: addressDoc.pincode,
      country: addressDoc.country || "India",
    };

    const [order] = await Order.create(
      [
        {
          userId,
          items: orderData.items,
          subtotal: orderData.summary.payable,
          shippingCharge: orderData.summary.shipping,
          taxAmount: 0,
          totalAmount: orderData.summary.total,
          shippingAddress,
          shippingMeta,
          paymentMethod: "RAZORPAY",
          paymentStatus: "PAID",
          paymentGateway: {
            provider: "razorpay",
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            signature: razorpay_signature,
          },
          status: "CONFIRMED",
          statusHistory: [
            {
              orderStatus: "CONFIRMED",
              changedAt: new Date(),
              changedBy: null,
              reason: "Payment confirmed via Razorpay",
            },
          ],
        },
      ],
      { session }
    );

    // ✅ Reduce stock
    for (const item of orderData.items) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { session }
      );

      if (!updated) throw new Error(`${item.name} out of stock`);
    }

    // ✅ Clear cart
    if (orderData.checkoutType === "CART") {
      await Cart.deleteOne({ user: userId }).session(session);
    }

    await session.commitTransaction();
    session.endSession();

    let shiprocketCreated = false;
    try {
      const orderForShip = await Order.findById(order._id);
      if (orderForShip) {
        await createShiprocketOrder(orderForShip);
        shiprocketCreated = true;
      }
    } catch {
      /* Order persisted; admin can create shipment if Shiprocket failed */
    }

    return res.json({
      success: true,
      message: "Payment verified & order confirmed",
      orderId: order._id,
      orderSummary: {
        subtotal: order.subtotal,
        shippingCharge: order.shippingCharge,
        totalAmount: order.totalAmount
      },
      shiprocketCreated,
    });

  } catch (err) {
    // ✅ Only abort if transaction hasn't been committed
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();

    console.error("Verify Razorpay Payment failed:", err.message);
    return res.status(400).json({ message: err.message });
  }
};
