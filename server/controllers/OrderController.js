const { ROLES } = require("../utils/constants");
const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const Razorpay = require("razorpay");
// controllers/orderController.js
const getShiprocketToken = require("../utils/shiprocket");
const { createShipment } = require("./shiprocketController"); // Import your Shiprocket logic

const axios = require("axios");
const Cart = require("../models/Cart");
const address = require("../models/address");
const { calculateOrder, calculateOrderBase } = require("../helper/createOrder");
const { createShiprocketOrder } = require("../service/shiprocketService");
const { default: mongoose } = require("mongoose");
const { validateStatusTransition } = require("../utils/orderStatusValidator");
var razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_RW5A57UKh8Dv3F",
  key_secret:
    process.env.RAZORPAY_KEY_SECRET ||
    "YourKeySecretHereHgijUZmybpNNR67lBrY4OumS",
});
console.log("RAZORPAY KEY:", process.env.RAZORPAY_KEY_ID);

const getOrdersByUserId = async (req, res) => {
  const userId = req.id;

  try {
    const orders = await Order.find({ userId }).sort({ createdAt: -1 }).lean();

    const simplifiedOrders = orders.map((order) => {
      const items = order.items || [];

      return {
        orderId: order._id,
        date: order.createdAt,
        orderNumber:order.orderNumber,
        status: order.status,

        // ✅ NEW SCHEMA SOURCE OF TRUTH
        subtotal: order.subtotal,
        shippingCharge: order.shippingCharge,
        taxAmount: order.taxAmount,
        totalAmount: order.totalAmount,

        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        paymentGateway: order.paymentGateway || {},
        products: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId || null,

          name: item.name,
          sku: item.sku,
          image: item.image || null,

          price: item.finalPrice, // 👈 what user paid
          originalPrice: item.price, // optional (UI strike-through)
          discount: item.discount,

          quantity: item.quantity,
          color: item.color || "Default",
          size: item.size || "",
          weight: item.weight || 0,
        })),
      };
    });

    return res.status(200).json({
      success: true,
      data: simplifiedOrders,
    });
  } catch (error) {
    console.error("getOrdersByUserId error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getOrdersByOrderId = async (req, res) => {
  const { orderId } = req.params;
  const userId = req.id;

  try {
    // Find single order
    const order = await Order.findOne({
      _id: orderId,
      userId,
    }).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or you don't have access",
      });
    }

    const items = order.items || [];

    // Format single order response
    const simplifiedOrder = {
      _id: order._id,
      orderId: order._id,
      orderNumber:
        order.orderNumber ||
        `#${order._id.toString().slice(-12).toUpperCase()}`,
      date: order.createdAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      status: order.status,

      // Pricing
      amount: order.totalAmount,
      subtotal: order.subtotal || order.totalAmount,
      shippingCharge: order.shippingCharge || 0,
      tax: order.tax || 0,
      discount: order.discount || 0,

      // Payment
      paymentMethod: order.paymentMethod || "Cash on Delivery",
      paymentStatus: order.paymentStatus || "pending",
      transactionId: order.transactionId || null,

      // Shipping
      shippingAddress: order.shippingAddress || {
        name: "",
        street: "",
        city: "",
        state: "",
        pincode: "",
        phone: "",
      },

      // Products
      products: items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId || null,
        name: item.name,
        sku: item.sku,
        image: item.image || "/placeholder.png",
        price: item.finalPrice,
        originalPrice: item.price,
        discount: item.discount || 0,
        quantity: item.quantity,
        color: item.color || "Default",
        size: item.size || "",
        weight: item.weight || 0,
      })),
    };

    return res.status(200).json({
      success: true,
      data: simplifiedOrder, // Single object, not array
    });
  } catch (error) {
    console.error("getOrderById error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getAllOrders = async (req, res) => {
  // Admin check
  if (req.role !== ROLES.admin) {
    return res.status(403).json({
      success: false,
      message: "You are not authorized",
    });
  }

  let {
    page = 1,
    limit = 10,
    status,
    search,
    startDate,
    endDate,
    paymentMethod,
  } = req.query;

  page = Number(page);
  limit = Number(limit);

  // Build filter
  const filter = {};

  // Add status filter
  if (
    status &&
    [
      "PLACED",
      "CONFIRMED",
      "PACKED",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ].includes(status)
  ) {
    filter.status = status;
  }

  // Add payment method filter
  if (
    paymentMethod &&
    ["COD", "RAZORPAY", "CARD", "UPI", "NETBANKING"].includes(paymentMethod)
  ) {
    filter.paymentMethod = paymentMethod;
  }

  // Add date range filter
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  // Add search filter
  if (search) {
    filter.$or = [
      { _id: search },
      { "shippingAddress.name": { $regex: search, $options: "i" } },
      { "shippingAddress.phone": search },
      { "shippingAddress.email": { $regex: search, $options: "i" } },
    ];
  }

  try {
    // Execute both queries in parallel
    const [orders, count] = await Promise.all([
      Order.find(filter)
        .populate({
          path: "userId",
          select: "name email phone",
        })
        .populate({
          path: "statusHistory.changedBy",
          select: "name",
        })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      Order.countDocuments(filter),
    ]);

    // Transform data for frontend
    const data = orders.map((order) => ({
      _id: order._id,
      user: {
        name: order.userId?.name || "Guest",
        email: order.userId?.email || "",
        phone: order.userId?.phone || "",
      },
      items: (order.items || []).map((item) => ({
        productId: item.productId,
        name: item.name,
        image: item.image || null,
        price: item.finalPrice ?? item.price,
        quantity: item.quantity,
        color: item.color || "Default",
        size: item.size || "",
        lineTotal: (item.finalPrice ?? item.price) * item.quantity,
      })),
      address: order.shippingAddress || {},
      totalAmount: order.totalAmount || 0,
      subtotal: order.subtotal || 0,
      shippingCharge: order.shippingCharge || 0,
      taxAmount: order.taxAmount || 0,
      payment: {
        method: order.paymentMethod,
        status: order.paymentStatus || "PENDING",
        paymentId: order.paymentGateway?.paymentId || null,
      },
      status: order.status || "PLACED",
      statusHistory: order.statusHistory || [],
      cancelReason: order.cancelReason,
      deliveredAt: order.deliveredAt,
      shippingProvider: order.shippingProvider,
      awbCode: order.awbCode,
      estimatedDelivery: order.estimatedDelivery,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        totalOrders: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        pageSize: limit,
        hasNextPage: page < Math.ceil(count / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("getAllOrders error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// controllers/admin/orderController.js
const updateOrderStatus = async (req, res) => {
  // Admin check
  if (req.role !== ROLES.admin) {
    return res.status(403).json({
      success: false,
      message: "Only admin can update order status",
    });
  }

  const { orderId } = req.params;
  const { status, reason } = req.body;

  // Validate status
  const validStatuses = [
    "PLACED",
    "CONFIRMED",
    "PACKED",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status value",
    });
  }

  try {
    // Find order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Store old status
    const oldStatus = order.status;

    // Simple validation
    if (oldStatus === status) {
      return res.status(400).json({
        success: false,
        message: "Order is already in this status",
      });
    }

    // ✅ Update status
    order.status = status;

    // ✅ Add to statusHistory array (embedded - aapka existing structure)
    order.statusHistory.push({
      status: status,
      changedAt: new Date(),
      changedBy: req.userId,
      reason:
        reason || `Status changed from ${oldStatus} to ${status} by admin`,
    });

    // Handle delivery
    if (status === "DELIVERED") {
      order.deliveredAt = new Date();
      if (order.paymentMethod === "COD") {
        order.paymentStatus = "PAID";
      }
    }

    // Handle cancellation
    if (status === "CANCELLED") {
      order.cancelReason = reason;
    }

    // Save the order (statusHistory automatically saved with it)
    await order.save();

    return res.status(200).json({
      success: true,
      data: {
        orderId: order._id,
        oldStatus: oldStatus,
        newStatus: status,
        statusHistory: order.statusHistory, // ✅ Embedded history automatically included
      },
      message: `Order status updated from ${oldStatus} to ${status}`,
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
      message: "Not authorized",
    });
  }

  try {
    const now = new Date();

    /* =========================
       DATE RANGES
    ========================= */
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    /* =========================
       SALES (TOTAL + MONTHLY)
    ========================= */
    const [totalSalesAgg, thisMonthSalesAgg, lastMonthSalesAgg] =
      await Promise.all([
        // 🔥 ALL-TIME SALES
        Order.aggregate([
          {
            $group: {
              _id: null,
              total: { $sum: "$totalAmount" },
            },
          },
        ]),

        // THIS MONTH
        Order.aggregate([
          {
            $match: {
              createdAt: {
                $gte: startOfThisMonth,
                $lt: startOfNextMonth,
              },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$totalAmount" },
            },
          },
        ]),

        // LAST MONTH
        Order.aggregate([
          {
            $match: {
              createdAt: {
                $gte: startOfLastMonth,
                $lt: startOfThisMonth,
              },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$totalAmount" },
            },
          },
        ]),
      ]);

    const totalSales = totalSalesAgg[0]?.total || 0;
    const totalThisMonth = thisMonthSalesAgg[0]?.total || 0;
    const totalLastMonth = lastMonthSalesAgg[0]?.total || 0;

    const salesGrowth = totalLastMonth
      ? ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100
      : 0;

    /* =========================
       USERS (THIS VS LAST MONTH)
    ========================= */
    const [thisMonthUsers, lastMonthUsers] = await Promise.all([
      User.countDocuments({
        createdAt: { $gte: startOfThisMonth, $lt: startOfNextMonth },
      }),
      User.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
      }),
    ]);

    const usersGrowth = lastMonthUsers
      ? ((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100
      : 0;

    /* =========================
       ACTIVE ORDERS (LAST HOUR)
    ========================= */
    const activeNow = await Order.countDocuments({
      createdAt: { $gte: oneHourAgo },
    });

    /* =========================
       RECENT ORDERS
    ========================= */
    const recentOrders = await Order.find()
      .populate({ path: "userId", select: "name email" })
      .select("totalAmount userId createdAt")
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    /* =========================
       6 MONTH CATEGORY CHART
    ========================= */
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const categoryChart = await Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },

      { $unwind: "$items" },

      // 🔗 Order → Product
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },

      // 🔗 Product → Category
      {
        $lookup: {
          from: "categories",
          localField: "product.category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },

      // 📊 GROUP
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            category: "$category.name", // ✅ HUMAN READABLE
          },
          count: { $sum: "$items.quantity" },
        },
      },
    ]);
    const monthlySalesTrend = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },

          // ❗ CANCELLED orders excluded
          status: { $nin: ["CANCELLED", "CANCELLED_BY_USER"] },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalAmount: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $addFields: {
          aov: {
            $cond: [
              { $eq: ["$totalOrders", 0] },
              0,
              { $divide: ["$totalAmount", "$totalOrders"] },
            ],
          },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        sales: {
          total: totalSales, // 🔥 all-time
          thisMonth: totalThisMonth, // 🔥 current month
          growth: salesGrowth,
        },
        users: {
          count: thisMonthUsers,
          growth: usersGrowth,
        },
        activeNow: {
          count: activeNow,
        },
        recentSales: recentOrders,
        sixMonthsBarChartData: categoryChart,
        monthlySalesTrend,
      },
    });
  } catch (error) {
    console.error("getMetrics error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Cancel COD orders within 24 hours
const cancelOrder = async (req, res) => {
  try {
    const { orderId, reason } = req.body;
    const userId = req.id; // assuming auth middleware sets this

    /* ================= VALIDATION ================= */
    // if (!orderId || !reason) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Order ID and cancellation reason are required",
    //   });
    // }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Order ID",
      });
    }

    /* ================= FETCH ORDER ================= */
    const order = await Order.findById(orderId);
    console.log(order);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    /* ================= OWNERSHIP CHECK ================= */
    if (order.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to cancel this order",
      });
    }

    /* ================= BUSINESS RULES ================= */

    // Only COD orders
    // if (order.paymentMethod !== "COD") {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Only COD orders can be cancelled by user",
    //   });
    // }

    // Status validation
    const cancellableStatuses = ["PLACED", "CONFIRMED", "PACKED"];
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled in '${order.status}' state`,
      });
    }

    // 24 hour window
    const hoursPassed =
      (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60);

    // if (hoursPassed > 24) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Order can only be cancelled within 24 hours",
    //   });
    // }

    /* ================= UPDATE ORDER ================= */

    order.status = "CANCELLED";
    order.cancelReason = reason;

    order.statusHistory.push({
      status: "CANCELLED",
      note: reason,
      updatedBy: "USER",
      updatedAt: new Date(),
    });

    await order.save();

    /* ================= RESPONSE ================= */
    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: {
        orderId: order._id,
        status: order.status,
        cancelReason: order.cancelReason,
      },
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while cancelling order",
    });
  }
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

const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.id;
    console.log();
    const { addressId, productId, quantity } = req.body;

    if (!addressId) {
      throw new Error("Address required");
    }

    /* 1️⃣ ADDRESS SNAPSHOT */
    const addressDoc = await address.findById(addressId).session(session);
    if (!addressDoc) {
      throw new Error("Invalid address");
    }

    const shippingAddress = {
      name: addressDoc.name,
      phone: addressDoc.phone,
      email: addressDoc.email,
      addressLine1: addressDoc.address_line1,
      addressLine2: addressDoc.address_line2,
      city: addressDoc.city,
      state: addressDoc.state,
      pincode: addressDoc.pincode,
      country: addressDoc.country || "India",
    };

    /* 2️⃣ CALCULATE ORDER (READ ONLY) */
    const orderData = await calculateOrder(userId, {
      productId,
      quantity,
    },shippingAddress);

    /* 3️⃣ CREATE ORDER FIRST */
    const order = await Order.create(
      [
        {
          userId,
          items: orderData.items,
          subtotal: orderData.summary.subtotal,
          shippingCharge: orderData.summary.shipping,
          totalAmount: orderData.summary.total,
          shippingAddress,
          paymentMethod: "COD",
          paymentStatus: "PENDING",
          status: "PLACED",
          statusHistory: [
            {
              status: "PLACED",
              changedAt: new Date(),
              changedBy: userId,
              reason: "Order placed by customer",
            },
          ],
        },
      ],
      { session }
    );
    const orderId = order[0]._id;
    /* 4️⃣ REDUCE STOCK (ATOMIC) */
    for (const item of orderData.items) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { session }
      );

      if (!updated) {
        throw new Error(`${item.name} out of stock`);
      }
    }

    /* 5️⃣ CLEAR CART (ONLY CART CHECKOUT) */
    if (orderData.checkoutType === "CART") {
      await Cart.deleteOne({ user: userId }).session(session);
    }

    await session.commitTransaction();
    session.endSession();
    setImmediate(async () => {
      try {
        const freshOrder = await Order.findById(orderId);
        if (!freshOrder) return;
console.log("freshOrder",freshOrder)
        // await createShiprocketOrder(freshOrder);
      } catch (err) {
        console.error("❌ Auto Shiprocket failed:", err.message);
      }
    });
    return res.status(201).json({
      success: true,
      message: "COD order placed successfully",
      orderId: order[0]._id,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error("❌ Create COD Order Error:", err);
    return res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getOrdersByUserId,
  getOrdersByOrderId,
  getAllOrders,
  updateOrderStatus,
  getMetrics,
  createOrder,
  cancelOrder,
  exchangeOrder,
  trackShipment,
};
