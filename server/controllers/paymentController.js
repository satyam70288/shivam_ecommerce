const crypto = require("crypto");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");

exports.verifyPayment = async (req, res) => {
  try {
    const userId = req.id;

    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // 1️⃣ Basic validation
    if (
      !orderId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details",
      });
    }

    // 2️⃣ Fetch order from DB
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // 3️⃣ Prevent double payment
    if (order.isPaid) {
      return res.status(400).json({
        success: false,
        message: "Order already paid",
      });
    }

    // 4️⃣ Verify Razorpay signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // 5️⃣ Reduce stock (AFTER successful payment)
    for (const item of order.products) {
      const product = await Product.findById(item.productId);

      if (!product || product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Stock issue for ${item.name}`,
        });
      }

      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    // 6️⃣ Update order as PAID
    order.isPaid = true;
    order.status = "confirmed";
    order.razorpayOrderId = razorpay_order_id;
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;

    await order.save();

    // 7️⃣ Clear cart (only if cart-based order)
    await Cart.deleteOne({ user: userId });

    return res.status(200).json({
      success: true,
      message: "Payment verified, order confirmed",
      orderId: order._id,
    });

  } catch (error) {
    console.error("Verify Payment Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
