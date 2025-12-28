const router = require("express").Router();
const {
  getOrdersByUserId,
  getAllOrders,
  getMetrics,
  updateOrderStatus,

  trackShipment,
  cancelOrder,
  createOrder,
  getOrdersByOrderId,
} = require("../controllers/OrderController");
const verifyToken = require("../middlewares/verifyToken");

router.get("/get-orders-by-user-id", verifyToken, getOrdersByUserId);

router.get("/get-all-orders", verifyToken, getAllOrders);

router.get("/get-metrics", verifyToken, getMetrics);

router.put("/update-order-status/:orderId", verifyToken, updateOrderStatus);

router.post("/orders/create", verifyToken, createOrder);

router.get("/track/:id", trackShipment);

router.post("/cancel-order", verifyToken, cancelOrder);

router.get("/orders/:orderId", verifyToken, getOrdersByOrderId);
module.exports = router;
