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
   console.log("regggggg",req.body)
    /* ================= BASIC VALIDATION ================= */
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!addressId) {
      return res.status(400).json({ message: "Address is required" });
    }

    // ✅ Address pehle get karo (shipping calculation ke liye)
    const addressDoc = await Address.findById(addressId);
    if (!addressDoc) {
      return res.status(400).json({ message: "Address not found" });
    }

    /* ================= SERVER-SIDE PRICE CALC WITH ADDRESS ================= */
    const orderData = await calculateOrder(
      userId, 
      { productId, quantity },
      addressDoc // ✅ IMPORTANT: Address pass karo
    );

    /**
     * orderData structure:
     * {
     *   items: [],
     *   summary: { subtotal, discount, shipping, total },
     *   checkoutType
     * }
     */

    // ✅ Debug logging
    console.log("Create Razorpay Order - Shipping Details:", {
      shippingCharge: orderData.summary.shipping,
      pincode: addressDoc.pincode,
      totalWeight: orderData.summary.totalWeight,
      totalAmount: orderData.summary.total
    });

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

    // ✅ Address pehle get karo (calculateOrder ke liye chahiye)
    const addressDoc = await Address.findById(addressId).session(session);
    if (!addressDoc) throw new Error("Invalid address");

    // ✅ Recalculate order WITH ADDRESS
    const orderData = await calculateOrder(
      userId, 
      { productId, quantity },
      addressDoc // ✅ IMPORTANT: Address pass karo
    );

    

    // ✅ Amount verify
    const rpOrder = await razorpay.orders.fetch(razorpay_order_id);
    const expectedAmount = Math.round(orderData.summary.total * 100);

    if (rpOrder.amount !== expectedAmount) {
      console.error("Amount Mismatch:", {
        razorpayAmount: rpOrder.amount,
        calculatedAmount: expectedAmount,
        total: orderData.summary.total,
        shipping: orderData.summary.shipping
      });
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

    // ✅ Create order with shipping charge
    const [order] = await Order.create(
      [
        {
          userId,
          items: orderData.items,
          subtotal: orderData.summary.payable,
          shippingCharge: orderData.summary.shipping, // ✅ Shipping charge included
          taxAmount: 0,
          totalAmount: orderData.summary.total, // ✅ This includes shipping
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

    // ✅ Commit DB transaction FIRST
    await session.commitTransaction();
    session.endSession();

    // ✅ NOW call createShiprocketOrder (outside transaction)
    try {
      await createShiprocketOrder(order);
      console.log("✅ Shiprocket order created successfully");
    } catch (shiprocketError) {
      console.error("⚠️ Shiprocket order creation failed:", shiprocketError);
      // Shiprocket fail hua, lekin order database mein save ho gaya
    }

    return res.json({
      success: true,
      message: "Payment verified & order confirmed",
      orderId: order._id,
      orderSummary: {
        subtotal: order.subtotal,
        shippingCharge: order.shippingCharge, // ✅ Confirm shipping charge
        totalAmount: order.totalAmount
      },
      shiprocketCreated: true,
    });

  } catch (err) {
    // ✅ Only abort if transaction hasn't been committed
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();

    console.error("Verify Razorpay Payment Error:", err);
    return res.status(400).json({ message: err.message });
  }
};
