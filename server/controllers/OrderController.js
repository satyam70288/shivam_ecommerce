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
const {
  calculateOrder,
  calculateOrderBase,
  calculateOrderValidation,
} = require("../helper/createOrder");
const {
  createShiprocketOrder,
  assignCourier,
  calculateShippingCharge,
  trackByAwb,
  refreshLabelAndInvoice,
  generateLabelUrl,
  generateInvoiceUrl,
} = require("../service/shiprocketService");
const { default: mongoose } = require("mongoose");
const { validateStatusTransition } = require("../utils/orderStatusValidator");

/** Inventory was decremented when order was placed; restore only for these pre-shipment states */
const STATUSES_RESTORE_STOCK_ON_CANCEL = ["PLACED", "CONFIRMED", "PACKED"];

async function restoreStockForOrderItems(order, session) {
  const opts = session ? { session } : {};
  for (const item of order.items || []) {
    const pid = item.productId;
    const qty = Number(item.quantity) || 0;
    if (!pid || qty <= 0) continue;
    await Product.findByIdAndUpdate(pid, { $inc: { stock: qty } }, opts);
  }
}
var razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_RW5A57UKh8Dv3F",
  key_secret:
    process.env.RAZORPAY_KEY_SECRET ||
    "YourKeySecretHereHgijUZmybpNNR67lBrY4OumS",
});

const getOrdersByUserId = async (req, res) => {
  const userId = req.id;

  try {
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .populate("currentShipmentId")
      .lean();

    const simplifiedOrders = orders.map((order) => {
      const ship = order.currentShipmentId;
      const items = order.items || [];

      return {
        orderId: order._id,
        date: order.createdAt,
        orderNumber: order.orderNumber,
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
        shipment: ship
          ? {
              awb: ship.awb,
              courier: ship.courier,
              trackingUrl: ship.trackingUrl,
              shippingStatus: ship.shippingStatus,
            }
          : null,
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
    const isObjectId =
      mongoose.Types.ObjectId.isValid(orderId) &&
      String(new mongoose.Types.ObjectId(orderId)) === orderId;

    const query = { userId };
    if (isObjectId) {
      query._id = orderId;
    } else {
      query.orderNumber = decodeURIComponent(orderId);
    }

    const order = await Order.findOne(query)
      .populate("currentShipmentId")
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or you don't have access",
      });
    }

    const items = order.items || [];
    const ship = order.currentShipmentId;

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
      shipment: ship
        ? {
            provider: ship.provider,
            awb: ship.awb,
            courier: ship.courier,
            trackingUrl: ship.trackingUrl,
            labelUrl: ship.labelUrl,
            invoiceUrl: ship.invoiceUrl,
            shippingStatus: ship.shippingStatus,
            shiprocketOrderId: ship.shiprocketOrderId,
          }
        : null,
    };

    return res.status(200).json({
      success: true,
      data: simplifiedOrder,
    });
  } catch (error) {
    console.error("getOrderById error:", error);
    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
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
      message: "You are not authorized",
    });
  }

  let {
    page = 1,
    limit = 10,
    orderStatus,
    shippingStatus,
    search,
    startDate,
    endDate,
    paymentMethod,
  } = req.query;

  page = Number(page);
  limit = Number(limit);

  const filter = {};

  /* ================= ORDER STATUS FILTER ================= */
  if (
    orderStatus &&
    ["PLACED", "CONFIRMED", "CANCELLED", "REFUNDED"].includes(orderStatus)
  ) {
    filter.orderStatus = orderStatus;
  }

  /* ================= PAYMENT METHOD FILTER ================= */
  if (
    paymentMethod &&
    ["COD", "RAZORPAY", "CARD", "UPI", "NETBANKING"].includes(paymentMethod)
  ) {
    filter.paymentMethod = paymentMethod;
  }

  /* ================= DATE FILTER ================= */
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  /* ================= SEARCH FILTER ================= */
  if (search) {
    const searchConditions = [];

    if (mongoose.Types.ObjectId.isValid(search)) {
      searchConditions.push({ _id: new mongoose.Types.ObjectId(search) });
    }

    searchConditions.push(
      { "shippingAddress.name": { $regex: search, $options: "i" } },
      { "shippingAddress.phone": { $regex: search, $options: "i" } },
      { "shippingAddress.email": { $regex: search, $options: "i" } },
      { orderNumber: { $regex: search, $options: "i" } }
    );

    filter.$or = searchConditions;
  }

  try {
    const orders = await Order.find(filter)
      .populate({
        path: "userId",
        select: "name email phone",
      })
      .populate({
        path: "statusHistory.changedBy",
        select: "name",
      })
      .populate({
        path: "currentShipmentId",
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    /* ================= SHIPPING STATUS FILTER (FROM SHIPMENT) ================= */
    let filteredOrders = orders;

    if (
      shippingStatus &&
      [
        "CREATED",
        "COURIER_ASSIGNED",
        "PICKED_UP",
        "IN_TRANSIT",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "RTO",
        "CANCELLED",
      ].includes(shippingStatus)
    ) {
      filteredOrders = orders.filter(
        (order) => order.currentShipmentId?.shippingStatus === shippingStatus
      );
    }

    const count = filteredOrders.length;

    const data = filteredOrders.map((order) => ({
      _id: order._id,
      orderNumber: order.orderNumber,

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

      subtotal: order.subtotal || 0,
      shippingCharge: order.shippingCharge || 0,
      taxAmount: order.taxAmount || 0,
      totalAmount: order.totalAmount || 0,
      payment: {
        method: order.paymentMethod,
        status: order.paymentStatus || "PENDING",
        paymentId: order.paymentGateway?.paymentId || null,
      },

      status: order.status,
      statusHistory: order.statusHistory || [],

      shipment: order.currentShipmentId
        ? {
            provider: order.currentShipmentId.provider,
            awb: order.currentShipmentId.awb,
            courier: order.currentShipmentId.courier,
            trackingUrl: order.currentShipmentId.trackingUrl,
            labelUrl: order.currentShipmentId.labelUrl,
            invoiceUrl: order.currentShipmentId.invoiceUrl,
            shippingStatus: order.currentShipmentId.shippingStatus,
            shiprocketOrderId: order.currentShipmentId.shiprocketOrderId,
            shiprocketShipmentId: order.currentShipmentId.shiprocketShipmentId,
          }
        : null,

      cancelReason: order.cancelReason,
      deliveredAt: order.deliveredAt,

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
  if (req.role !== ROLES.admin) {
    return res.status(403).json({
      success: false,
      message: "Only admin can update order status",
    });
  }

  const { orderId } = req.params;
  const { status, reason } = req.body;

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

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(orderId).session(session);

    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const oldStatus = order.status;

    if (oldStatus === status) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Order is already in this status",
      });
    }

    if (status === "CANCELLED") {
      if (STATUSES_RESTORE_STOCK_ON_CANCEL.includes(oldStatus)) {
        await restoreStockForOrderItems(order, session);
      }
      order.cancelReason = reason;
    }

    order.status = status;

    order.statusHistory.push({
      orderStatus: status,
      changedAt: new Date(),
      changedBy: req.id,
      reason:
        reason || `Status changed from ${oldStatus} to ${status} by admin`,
    });

    if (status === "DELIVERED") {
      order.deliveredAt = new Date();
      if (order.paymentMethod === "COD") {
        order.paymentStatus = "PAID";
      }
    }

    await order.save({ session });
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      data: {
        orderId: order._id,
        oldStatus: oldStatus,
        newStatus: status,
        statusHistory: order.statusHistory,
        stockRestored:
          status === "CANCELLED" &&
          STATUSES_RESTORE_STOCK_ON_CANCEL.includes(oldStatus),
      },
      message: `Order status updated from ${oldStatus} to ${status}`,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
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

    /* =========================
       YEAR-WISE (12 MONTHS)
    ========================= */
    const selectedYear = Number(req.query.year) || now.getFullYear();
    const startOfYear = new Date(selectedYear, 0, 1);
    const startOfNextYear = new Date(selectedYear + 1, 0, 1);
    const startOfPrevYear = new Date(selectedYear - 1, 0, 1);

    const buildMonthlyBreakdown = (aggRows) => {
      const map = new Map(aggRows.map((row) => [row._id.month, row]));
      return Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const row = map.get(month);
        const totalAmount = row?.totalAmount || 0;
        const totalOrders = row?.totalOrders || 0;
        return {
          month,
          totalAmount,
          totalOrders,
          aov:
            totalOrders > 0
              ? Math.round((totalAmount / totalOrders) * 100) / 100
              : 0,
        };
      });
    };

    const [yearMonthlyAgg, prevYearMonthlyAgg, earliestOrder, yearsWithOrders] =
      await Promise.all([
        Order.aggregate([
          {
            $match: {
              createdAt: { $gte: startOfYear, $lt: startOfNextYear },
              status: { $nin: ["CANCELLED", "CANCELLED_BY_USER"] },
            },
          },
          {
            $group: {
              _id: { month: { $month: "$createdAt" } },
              totalAmount: { $sum: "$totalAmount" },
              totalOrders: { $sum: 1 },
            },
          },
        ]),
        Order.aggregate([
          {
            $match: {
              createdAt: { $gte: startOfPrevYear, $lt: startOfYear },
              status: { $nin: ["CANCELLED", "CANCELLED_BY_USER"] },
            },
          },
          {
            $group: {
              _id: { month: { $month: "$createdAt" } },
              totalAmount: { $sum: "$totalAmount" },
              totalOrders: { $sum: 1 },
            },
          },
        ]),
        Order.findOne({
          status: { $nin: ["CANCELLED", "CANCELLED_BY_USER"] },
        })
          .sort({ createdAt: 1 })
          .select("createdAt")
          .lean(),
        Order.aggregate([
          {
            $match: {
              status: { $nin: ["CANCELLED", "CANCELLED_BY_USER"] },
            },
          },
          {
            $group: {
              _id: { $year: "$createdAt" },
            },
          },
          { $sort: { _id: -1 } },
        ]),
      ]);

    const yearlyMonthlyBreakdown = buildMonthlyBreakdown(yearMonthlyAgg);
    const prevYearMonthlyBreakdown = buildMonthlyBreakdown(prevYearMonthlyAgg);

    const yearTotalRevenue = yearlyMonthlyBreakdown.reduce(
      (s, m) => s + m.totalAmount,
      0
    );
    const yearTotalOrders = yearlyMonthlyBreakdown.reduce(
      (s, m) => s + m.totalOrders,
      0
    );
    const prevYearTotal = prevYearMonthlyBreakdown.reduce(
      (s, m) => s + m.totalAmount,
      0
    );
    const yearOverYearGrowth = prevYearTotal
      ? ((yearTotalRevenue - prevYearTotal) / prevYearTotal) * 100
      : yearTotalRevenue > 0
        ? 100
        : 0;

    const METRICS_START_YEAR = 2020;
    const maxYear = now.getFullYear();

    const earliestYear = earliestOrder?.createdAt
      ? new Date(earliestOrder.createdAt).getFullYear()
      : maxYear;

    // Always list full year range for dropdown (even months with ₹0 sales)
    const minYear = Math.min(earliestYear, METRICS_START_YEAR, selectedYear);

    const availableYears = [];
    for (let y = maxYear; y >= minYear; y--) {
      availableYears.push(y);
    }

    return res.status(200).json({
      success: true,
      data: {
        sales: {
          total: totalSales,
          thisMonth: totalThisMonth,
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
        selectedYear,
        availableYears,
        yearlyMonthlyBreakdown,
        prevYearMonthlyBreakdown,
        yearRange: { min: minYear, max: maxYear },
        yearSummary: {
          year: selectedYear,
          totalRevenue: yearTotalRevenue,
          totalOrders: yearTotalOrders,
          avgMonthlyRevenue:
            Math.round((yearTotalRevenue / 12) * 100) / 100,
          prevYearTotal,
          yearOverYearGrowth,
        },
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

const cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { orderId, reason } = req.body;
    const userId = req.id;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Invalid Order ID",
      });
    }

    const order = await Order.findById(orderId).session(session);
    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.userId.toString() !== userId.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: "You are not allowed to cancel this order",
      });
    }

    const cancellableStatuses = ["PLACED", "CONFIRMED", "PACKED"];
    if (!cancellableStatuses.includes(order.status)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled in '${order.status}' state`,
      });
    }

    await restoreStockForOrderItems(order, session);

    order.status = "CANCELLED";
    order.cancelReason = reason;

    order.statusHistory.push({
      orderStatus: "CANCELLED",
      changedAt: new Date(),
      changedBy: userId,
      reason: reason || "Cancelled by customer",
    });

    await order.save({ session });
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: {
        orderId: order._id,
        status: order.status,
        cancelReason: order.cancelReason,
        stockRestored: true,
      },
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    console.error("Cancel order error:", error.message);
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

async function findUserOrder(req) {
  const orderId = req.params.id || req.params.orderId;
  const userId = req.id;
  const isObjectId =
    mongoose.Types.ObjectId.isValid(orderId) &&
    String(new mongoose.Types.ObjectId(orderId)) === orderId;

  const query = {};
  if (isObjectId) query._id = orderId;
  else query.orderNumber = decodeURIComponent(orderId);

  const order = await Order.findOne(query).populate("currentShipmentId");
  if (!order) return null;

  const isAdmin = req.role === ROLES.admin;
  if (!isAdmin && order.userId.toString() !== userId.toString()) {
    return null;
  }
  return order;
}

const trackShipment = async (req, res) => {
  try {
    const order = await findUserOrder(req);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    let shipment = order.currentShipmentId;

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not created yet. Admin will process your order soon.",
      });
    }

    if (!shipment.awb && order.shippingMeta?.courierId) {
      try {
        shipment = await assignCourier(order._id);
      } catch (assignErr) {
        console.warn("Auto AWB assign:", assignErr.message);
      }
    }

    if (!shipment.awb) {
      return res.status(400).json({
        success: false,
        message: "AWB not assigned yet. Tracking will be available once shipped.",
        shipment: {
          shippingStatus: shipment.shippingStatus,
          shiprocketOrderId: shipment.shiprocketOrderId,
        },
      });
    }

    const tracking = await trackByAwb(shipment.awb);
    const td = tracking?.tracking_data || {};

    return res.json({
      success: true,
      shipment: {
        courier: shipment.courier,
        awb: shipment.awb,
        trackingUrl: shipment.trackingUrl,
        labelUrl: shipment.labelUrl,
        invoiceUrl: shipment.invoiceUrl,
        currentStatus: td.shipment_status || td.shipment_status_id,
        history: td.shipment_track_activities || td.shipment_track || [],
      },
    });
  } catch (err) {
    console.error("Track error:", err.response?.data || err.message);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch tracking details",
    });
  }
};

const getShiprocketLabel = async (req, res) => {
  try {
    const order = await findUserOrder(req);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    let shipment = order.currentShipmentId;
    if (!shipment) {
      return res.status(404).json({ success: false, message: "No shipment" });
    }

    if (!shipment.labelUrl && shipment.shiprocketShipmentId) {
      const token = await getShiprocketToken();
      shipment.labelUrl = await generateLabelUrl(
        token,
        shipment.shiprocketShipmentId
      );
      await shipment.save();
    }

    if (!shipment.labelUrl) {
      return res.status(400).json({
        success: false,
        message: "Label not ready. Assign courier / create shipment first.",
      });
    }

    return res.json({ success: true, url: shipment.labelUrl });
  } catch (err) {
    console.error("Label error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getShiprocketInvoice = async (req, res) => {
  try {
    const order = await findUserOrder(req);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    let shipment = order.currentShipmentId;
    if (!shipment) {
      return res.status(404).json({ success: false, message: "No shipment" });
    }

    if (!shipment.invoiceUrl && shipment.shiprocketOrderId) {
      const token = await getShiprocketToken();
      shipment.invoiceUrl = await generateInvoiceUrl(
        token,
        shipment.shiprocketOrderId
      );
      await shipment.save();
    }

    if (!shipment.invoiceUrl) {
      return res.status(400).json({
        success: false,
        message: "Invoice not ready on Shiprocket yet.",
      });
    }

    return res.json({ success: true, url: shipment.invoiceUrl });
  } catch (err) {
    console.error("Invoice error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  let orderId;

  try {
    const userId = req.id;
    const { addressId, productId, quantity, shippingMeta } = req.body;
    if (!shippingMeta?.courierId) {
      throw new Error("Shipping info missing. Please re-checkout.");
    }
    if (!addressId) {
      throw new Error("Address required");
    }

    /* 1️⃣ ADDRESS SNAPSHOT */
    const addressDoc = await address.findById(addressId).session(session);
    if (!addressDoc) throw new Error("Invalid address");
    if (String(addressDoc.userId) !== String(userId)) {
      throw new Error("Address does not belong to you");
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

    /* 2️⃣ VALIDATE ORDER (price, stock, weight) */
    const orderData = await calculateOrderValidation(
      userId,
      { productId, quantity },
      shippingAddress
    );

    /* 3️⃣ AUTHORITATIVE SHIPPING (Shiprocket) */
    const preview = await calculateShippingCharge({
      deliveryPincode: shippingAddress.pincode,
      totalWeight: orderData.summary.totalWeight,
    });

    // ❌ If frontend courier is outdated / tampered
    if (preview.courierId !== shippingMeta.courierId) {
      throw new Error("Shipping option expired. Please re-checkout.");
    }

    const finalTotal = orderData.summary.payable + preview.shippingCharge;

    /* 4️⃣ CREATE ORDER */
    const order = await Order.create(
      [
        {
          userId,
          items: orderData.items,
          subtotal: orderData.summary.payable, // ✅ final selling amount
          shippingCharge: preview.shippingCharge,
          totalAmount: finalTotal,
          shippingMeta: {
            courierId: preview.courierId,
            courierName: preview.courierName,
            estimatedDelivery: preview.estimatedDelivery,
          },

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

    orderId = order[0]._id;

    /* 5️⃣ REDUCE STOCK */
    for (const item of orderData.items) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { session }
      );

      if (!updated) throw new Error(`${item.name} out of stock`);
    }

    /* 6️⃣ CLEAR CART */
    if (orderData.checkoutType === "CART") {
      await Cart.deleteOne({ user: userId }).session(session);
    }

    await session.commitTransaction();
  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    console.error("❌ Create COD Order Error:", err);
    return res.status(400).json({ message: err.message });
  }

  session.endSession();

  let shiprocketCreated = false;
  try {
    const orderDoc = await Order.findById(orderId);
    if (orderDoc) {
      await createShiprocketOrder(orderDoc);
      shiprocketCreated = true;
    }
  } catch (srErr) {
    console.error("⚠️ Shiprocket (COD) failed:", srErr);
  }

  return res.status(201).json({
    success: true,
    message: "COD order placed successfully",
    orderId,
    shiprocketCreated,
  });
};

const assignCourierController = async (req, res) => {
  try {
    const orderId = req.params.id;

    const result = await assignCourier(orderId);

    res.json({
      success: true,
      message: "Courier assigned successfully",
      data: result,
    });
  } catch (err) {
    console.error("Assign courier error:", err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

const createShipmentForOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    const shipment = await createShiprocketOrder(order);

    res.json({
      success: true,
      message: "Shipment created on Shiprocket",
      data: {
        shiprocketOrderId: shipment.shiprocketOrderId,
        awb: shipment.awb,
        trackingUrl: shipment.trackingUrl,
        labelUrl: shipment.labelUrl,
        invoiceUrl: shipment.invoiceUrl,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const refreshShiprocketDocs = async (req, res) => {
  try {
    const shipment = await refreshLabelAndInvoice(req.params.id);
    res.json({
      success: true,
      message: "Documents refreshed from Shiprocket",
      data: {
        labelUrl: shipment.labelUrl,
        invoiceUrl: shipment.invoiceUrl,
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
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
  assignCourierController,
  createShipmentForOrder,
  getShiprocketLabel,
  getShiprocketInvoice,
  refreshShiprocketDocs,
};