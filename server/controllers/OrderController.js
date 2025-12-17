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
    const orders = await Order.find({ userId }).sort({ createdAt: -1 }).lean();

    const simplifiedOrders = orders.map((order) => {
      const items = order.items || [];

      return {
        orderId: order._id,
        date: order.createdAt,
        status: order.status,

        // ✅ NEW SCHEMA SOURCE OF TRUTH
        amount: order.totalAmount,

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

const getAllOrders = async (req, res) => {
  if (req.role !== ROLES.admin) {
    return res.status(403).json({
      success: false,
      message: "You are not authorized",
    });
  }

  let { page = 1, limit = 10 } = req.query;
  page = Number(page);
  limit = Number(limit);

  const filter = {}; // future-proof

  try {
    const [orders, count] = await Promise.all([
      Order.find(filter)
        .populate({
          path: "userId",
          select: "name email",
        })
        .populate({
          path: "items.productId",
          select: "_id",
        })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      Order.countDocuments(filter),
    ]);

    const data = orders.map((order) => ({
      _id: order._id,

      user: {
        name: order.userId?.name || "",
        email: order.userId?.email || "",
      },

      items: (order.items || []).map((item) => ({
        productId: item.productId?._id,
        name: item.name,
        image: item.image || null,
        price: item.finalPrice ?? item.price,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
      })),

      address: order.shippingAddress,

      totalAmount: order.totalAmount,

      payment: {
        method: order.paymentMethod,
        status: order.paymentStatus ?? (order.isPaid ? "PAID" : "PENDING"),
        paymentId:
          order.paymentGateway?.paymentId ||
          order.razorpayPaymentId ||
          null,
      },

      status: order.status,
      createdAt: order.createdAt,
    }));

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        totalOrders: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error("getAllOrders error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
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
      message: "Not authorized",
    });
  }

  try {
    const now = new Date();

    /* =========================
       DATE RANGES
    ========================= */
    const startOfThisMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const startOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );

    const startOfNextMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1
    );

    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    /* =========================
       SALES (TOTAL + MONTHLY)
    ========================= */
    const [
      totalSalesAgg,
      thisMonthSalesAgg,
      lastMonthSalesAgg,
    ] = await Promise.all([
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
    const sixMonthsAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 5,
      1
    );

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
      status: { $nin: ["CANCELLED", "CANCELLED_BY_USER"] }
    }
  },
  {
    $group: {
      _id: {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" }
      },
      totalAmount: { $sum: "$totalAmount" },
      totalOrders: { $sum: 1 }
    }
  },
  {
    $addFields: {
      aov: {
        $cond: [
          { $eq: ["$totalOrders", 0] },
          0,
          { $divide: ["$totalAmount", "$totalOrders"] }
        ]
      }
    }
  },
  {
    $sort: {
      "_id.year": 1,
      "_id.month": 1
    }
  }
]);



    return res.status(200).json({
      success: true,
      data: {
        sales: {
          total: totalSales,          // 🔥 all-time
          thisMonth: totalThisMonth,  // 🔥 current month
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
        monthlySalesTrend
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

const createOrder = async (req, res) => {
  try {
    const userId = req.id;
    const { paymentMode, addressId } = req.body;

    if (!paymentMode || !addressId) {
      return res.status(400).json({ message: "Missing fields" });
    }

    /* =========================
       ADDRESS SNAPSHOT
    ========================= */
    const addressDoc = await address.findById(addressId);
    if (!addressDoc) {
      return res.status(400).json({ message: "Invalid address" });
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

    /* =========================
       FETCH CART
    ========================= */
    const cart = await Cart.findOne({ user: userId }).populate(
      "products.product"
    );
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let items = [];
    let subtotal = 0;

    for (const cartItem of cart.products) {
      const product = cartItem.product;

      // if (!product || !product.isActive) {
      //   return res.status(400).json({ message: "Product unavailable" });
      // }

      if (product.stock < cartItem.quantity) {
        return res.status(400).json({
          message: `${product.name} out of stock`,
        });
      }

      const discount = product.isOfferActive() ? product.discount : 0;

      const finalPrice = product.getDiscountedPrice();

      subtotal += finalPrice * cartItem.quantity;

      items.push({
        productId: product._id,
        name: product.name,
        image: product.images?.[0]?.url,
        price: product.price,
        discount,
        finalPrice,
        quantity: cartItem.quantity,
        color: cartItem.color,
        size: cartItem.size,
      });
    }

    const shippingCharge = 0;
    const taxAmount = 0;
    const totalAmount = subtotal + shippingCharge + taxAmount;

    /* =========================
       CREATE ORDER
    ========================= */
    const order = await Order.create({
      userId,
      items,
      subtotal,
      shippingCharge,
      taxAmount,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMode === "COD" ? "COD" : "RAZORPAY",
      paymentStatus: paymentMode === "COD" ? "PENDING" : "PENDING",
      status: "PLACED",
    });

    /* =========================
       ONLINE PAYMENT
    ========================= */
    if (paymentMode === "ONLINE") {
      const razorpayOrder = await razorpay.orders.create({
        amount: totalAmount * 100,
        currency: "INR",
        receipt: `order_${order._id}`,
      });

      order.paymentGateway = {
        orderId: razorpayOrder.id,
      };

      await order.save();

      return res.status(201).json({
        success: true,
        orderId: order._id,
        razorpayOrder,
      });
    }

    /* =========================
       COD
    ========================= */
    await Cart.deleteOne({ user: userId });

    return res.status(201).json({
      success: true,
      message: "Order placed",
      orderId: order._id,
    });
  } catch (err) {
    console.error("Create Order Error:", err);
    res.status(500).json({ message: "Order creation failed" });
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
