const { ROLES } = require("../utils/constants");
const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
// controllers/orderController.js
const getShiprocketToken = require("../utils/shiprocket");
const { createShipment } = require("./shiprocketController"); // Import your Shiprocket logic

const axios = require("axios");
const Cart = require("../models/Cart");
const address = require("../models/address");
const getOrdersByUserId = async (req, res) => {
  const userId = req.id;

  try {
    const orders = await Order.find({ userId })
      .populate({
        path: "products.productId",
        select: "images",
      })
      .lean();

    const simplifiedOrders = orders.map(order => ({
      orderId: order._id,
      date: order.createdAt,
      status: order.status,
      amount: order.amount,
      products: order.products.map(p => ({
        productId: p.productId?._id,
        name: p.name,           // snapshot
        price: p.price,         // snapshot
        quantity: p.quantity,
        image: p.productId?.images?.[0]?.url || null,
      })),
    }));

    return res.status(200).json({
      success: true,
      data: simplifiedOrders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllOrders = async (req, res) => {
  if (req.role !== ROLES.admin) {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to access this resource",
    });
  }

  const { page, limit } = req.query;

  try {
    const orders = await Order.find()
      .populate({
        path: "products.id",
        select: "name price category variants",
      })
      .populate({
        path: "userId",
        select: "name email",
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    if (!orders)
      return res
        .status(404)
        .json({ success: false, message: "No orders to show" });

    const count = await Order.countDocuments();

    return res.status(200).json({
      success: true,
      data: orders,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  if (req.role !== ROLES.admin) {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to access this resource",
    });
  }

  const { paymentId } = req.params;
  const { status } = req.body;

  try {
    // Try to find by razorpayPaymentId (prepaid)
    let order = await Order.findOne({ razorpayPaymentId: paymentId });

    // If not found, try by _id (for COD)
    if (!order) {
      order = await Order.findById(paymentId);
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      success: true,
      data: order,
      message: "Order status updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

const getMetrics = async (req, res) => {
  if (req.role !== ROLES.admin) {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to access this route",
    });
  }

  const { startDate, endDate } = req.query;

  try {
    const start = new Date(
      startDate || new Date().setMonth(new Date().getMonth() - 1)
    );
    const end = new Date(endDate || new Date());

    // Orders in selected date range
    const ordersInRange = await Order.find({
      createdAt: { $gte: start, $lte: end },
    });

    const totalSales = ordersInRange.reduce(
      (acc, order) => acc + (order.amount || 0),
      0
    );

    // This month & last month orders
    const thisMonthOrders = ordersInRange;
    const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1));

    const lastMonthOrders = await Order.find({
      createdAt: { $gte: lastMonth, $lte: start },
    });

    const totalThisMonth = thisMonthOrders.reduce(
      (acc, order) => acc + (order.amount || 0),
      0
    );
    const totalLastMonth = lastMonthOrders.reduce(
      (acc, order) => acc + (order.amount || 0),
      0
    );

    const salesGrowth = totalLastMonth
      ? ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100
      : 0;

    // Users this month vs last month
    const thisMonthUsers = await User.find({
      createdAt: { $gte: start, $lte: end },
    });
    const lastMonthUsers = await User.find({
      createdAt: { $gte: lastMonth, $lte: start },
    });

    const usersGrowth = lastMonthUsers.length
      ? ((thisMonthUsers.length - lastMonthUsers.length) /
          lastMonthUsers.length) *
        100
      : 0;

    // Active now (last hour) vs previous day
    const lastHour = new Date(new Date().setHours(new Date().getHours() - 1));
    const lastHourOrders = await Order.find({
      createdAt: { $gte: lastHour, $lte: new Date() },
    });

    const previousDayOrders = await Order.find({
      createdAt: {
        $gte: new Date(new Date().setDate(new Date().getDate() - 1)),
      },
    });

    const lastHourGrowth = previousDayOrders.length
      ? (lastHourOrders.length / previousDayOrders.length) * 100
      : 0;

    // Recent sales
    const recentOrders = await Order.find()
      .populate({ path: "userId", select: "name email" })
      .select("amount")
      .sort({ createdAt: -1 })
      .limit(9);

    // Products delivered in last 6 months grouped by category/month
    const sixMonthsAgo = new Date(
      new Date().setMonth(new Date().getMonth() - 6)
    );

    const sixMonthsOrders = await Order.find({
      createdAt: { $gte: sixMonthsAgo },
    }).populate({
      path: "products.id",
      select: "category",
    });

    const monthWise = sixMonthsOrders.reduce((acc, order) => {
      const month = new Date(order.createdAt).toLocaleString("default", {
        month: "short",
      });

      order.products.forEach((product) => {
        // Skip missing or unlinked products
        if (!product.id || !product.id.category) return;

        if (!acc[month]) acc[month] = {};
        if (!acc[month][product.id.category]) {
          acc[month][product.id.category] = 1;
        } else {
          acc[month][product.id.category]++;
        }
      });

      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      data: {
        totalSales: { count: totalSales, growth: salesGrowth },
        users: { count: thisMonthUsers.length, growth: usersGrowth },
        sales: { count: totalThisMonth, growth: salesGrowth },
        activeNow: { count: lastHourOrders.length, growth: lastHourGrowth },
        recentSales: { count: totalThisMonth, users: recentOrders },
        sixMonthsBarChartData: monthWise,
      },
    });
  } catch (error) {
    console.error("Error in getMetrics:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createOrder = async (req, res) => {
  try {
    console.log("inside")
    const userId = req.id;
console.log( req.body);
    const {
      paymentMode,        // "COD" | "ONLINE"
      addressId,
      buyNow = false,
      productId,
      qty = 1,
      color,
      size,
    } = req.body;

    if (!paymentMode || !addressId) {
      return res.status(400).json({ message: "Missing fields" });
    }

    /* =========================
       FETCH ADDRESS (SNAPSHOT)
    ========================= */
    const addressDoc = await address.findById(addressId);
    if (!addressDoc) {
      return res.status(400).json({ message: "Invalid address" });
    }

    const shippingAddress = {
      name: addressDoc.name,
      phone: addressDoc.phone,
      email: addressDoc.email,
      address_line1: addressDoc.address_line1,
      address_line2: addressDoc.address_line2,
      city: addressDoc.city,
      state: addressDoc.state,
      pincode: addressDoc.pincode,
      country: addressDoc.country,
    };

    let items = [];
    let totalAmount = 0;

    /* =========================
       CASE 1️⃣ BUY NOW
    ========================= */
    if (buyNow) {
      if (!productId) {
        return res.status(400).json({ message: "Product ID required" });
      }

      const product = await Product.findById(productId);
      if (!product || product.blacklisted) {
        return res.status(400).json({ message: "Product unavailable" });
      }

      if (product.stock < qty) {
        return res.status(400).json({
          message: `${product.name} out of stock`,
        });
      }

      const price = product.getDiscountedPrice();
      totalAmount = price * qty;

      items.push({
        productId: product._id,
        name: product.name,
        price,
        quantity: qty,
        color,
        size,
      });
    }

    /* =========================
       CASE 2️⃣ CART CHECKOUT
    ========================= */
    else {
      const cart = await Cart.findOne({ user: userId }).populate("products.product");

      if (!cart || cart.products.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      for (const item of cart.products) {
        const product = item.product;

        if (!product || product.blacklisted) {
          return res.status(400).json({ message: "Product unavailable" });
        }

        if (product.stock < item.quantity) {
          return res.status(400).json({
            message: `${product.name} out of stock`,
          });
        }

        const price = product.getDiscountedPrice();
        totalAmount += price * item.quantity;

        items.push({
          productId: product._id,
          name: product.name,
          price,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
        });
      }
    }

    /* =========================
       COD ORDER
    ========================= */
    if (paymentMode === "COD") {
      // reduce stock immediately
      for (const item of items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });
      }

      const order = await Order.create({
        userId,
        amount: totalAmount,
        shippingCharge: 0,
        shippingAddress,
        paymentMode: "COD",
        isPaid: false,
        status: "confirmed",
        products: items,
      });

      if (!buyNow) {
        await Cart.deleteOne({ user: userId });
      }

      return res.status(201).json({
        success: true,
        message: "COD order placed",
        orderId: order._id,
      });
    }

    /* =========================
       ONLINE ORDER (RAZORPAY)
    ========================= */
    if (paymentMode === "ONLINE") {
      const razorpayOrder = await razorpay.orders.create({
        amount: totalAmount * 100,
        currency: "INR",
        receipt: `order_${Date.now()}`,
      });

      const order = await Order.create({
        userId,
        amount: totalAmount,
        shippingCharge: 0,
        shippingAddress,
        paymentMode: "Razorpay",
        isPaid: false,
        status: "pending",
        razorpay: {
          orderId: razorpayOrder.id,
        },
        products: items,
      });

      return res.status(201).json({
        success: true,
        orderId: order._id,
        razorpayOrder,
      });
    }

    return res.status(400).json({ message: "Invalid payment mode" });

  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Cancel COD orders within 24 hours
const cancelOrder = async (req, res) => {
  const { orderId, reason } = req.body;
  const order = await Order.findById(orderId);

  if (!order) return res.status(404).json({ message: "Order not found" });
  if (order.paymentMode !== "COD")
    return res.status(400).json({ message: "Only COD can cancel" });
  if (!["pending", "packed"].includes(order.status))
    return res.status(400).json({ message: "Cannot cancel now" });

  const hoursDiff = (new Date() - order.createdAt) / 36e5;
  if (hoursDiff > 24)
    return res.status(400).json({ message: "Cancel allowed within 24h only" });

  order.isCancelled = true;
  order.cancelReason = reason;
  order.cancelledAt = new Date();
  order.status = "cancelled";
  await order.save();

  res.json({ success: true, message: "Order cancelled", order });
};

// Exchange Paid Delivered Orders
const exchangeOrder = async (req, res) => {
  const { orderId, reason } = req.body;
  const order = await Order.findById(orderId);

  if (!order) return res.status(404).json({ message: "Order not found" });
  if (!order.isPaid)
    return res
      .status(400)
      .json({ message: "Only paid orders can be exchanged" });
  if (order.status !== "delivered")
    return res
      .status(400)
      .json({ message: "Only delivered orders can be exchanged" });

  order.isExchanged = true;
  order.exchangeReason = reason;
  order.exchangedAt = new Date();
  order.status = "exchanged";
  await order.save();

  res.json({ success: true, message: "Order exchanged", order });
};

const trackShipment = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order || !order.shiprocketId)
    return res
      .status(404)
      .json({ success: false, message: "Order not found or not shipped" });

  const token = await getShiprocketToken();

  const resShip = await axios.get(
    `https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${order.shiprocketId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return res.json({
    success: true,
    tracking: resShip.data.data[0].tracking_data,
  });
};

module.exports = {
  getOrdersByUserId,
  getAllOrders,
  updateOrderStatus,
  getMetrics,
  createOrder,
  cancelOrder,
  exchangeOrder,
  trackShipment,
};
