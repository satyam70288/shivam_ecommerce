// controllers/paymentController.js
const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const Address = require("../models/address");
const { calculateOrder } = require("../helper/createOrder");
const { default: mongoose } = require("mongoose");
const { createShiprocketOrder } = require("../service/shiprocketService");

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

    /* ================= SERVER-SIDE PRICE CALC ================= */
    const orderData = await calculateOrder(userId, {
      productId,
      quantity,
    });

    /**
     * orderData structure:
     * {
     *   items: [],
     *   summary: { subtotal, discount, shipping, total },
     *   checkoutType
     * }
     */

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
      },
    });

    /* ================= SUCCESS RESPONSE ================= */
    return res.status(200).json({
      success: true,
      razorpayOrderId: rpOrder.id,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
      orderSummary: orderData.summary, // frontend ke liye
    });
  } catch (error) {
    console.error("❌ Create Razorpay Order Error:", error);

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

    // ✅ Recalculate order
    const orderData = await calculateOrder(userId, { productId, quantity });

    // ✅ Amount verify
    const rpOrder = await razorpay.orders.fetch(razorpay_order_id);
    const expectedAmount = Math.round(orderData.summary.total * 100);

    if (rpOrder.amount !== expectedAmount) {
      throw new Error("Payment amount mismatch");
    }

    // ✅ Address snapshot
    const addressDoc = await Address.findById(addressId).session(session);
    if (!addressDoc) throw new Error("Invalid address");

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

    // ✅ Create order
    const [order] = await Order.create(
      [
        {
          userId,
          items: orderData.items,
          subtotal: orderData.summary.subtotal,
          shippingCharge: orderData.summary.shipping,
          totalAmount: orderData.summary.total,
          shippingAddress,
          paymentMethod: "RAZORPAY",
          paymentStatus: "PAID",
          shippingStatus: "NOT_CREATED",
          paymentGateway: {
            provider: "razorpay",
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            signature: razorpay_signature,
          },
          status: "CONFIRMED",
          statusHistory: [
            {
              status: "CONFIRMED",
              changedAt: new Date(),
              changedBy: "system",
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

    // ✅ Commit DB transaction
    await session.commitTransaction();
    session.endSession();

    
    await createShiprocketOrder(order);

    return res.json({
      success: true,
      message: "Payment verified, order confirmed & shipment created",
      orderId: order._id,
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Verify Razorpay Payment Error:", err);
    return res.status(400).json({ message: err.message });
  }
};

