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
  assignCourierController,
  createShipmentForOrder,
  getShiprocketLabel,
  getShiprocketInvoice,
  refreshShiprocketDocs,
} = require("../controllers/OrderController");
const verifyToken = require("../middlewares/verifyToken");
const { assignCourier } = require("../service/shiprocketService");

router.get("/get-orders-by-user-id", verifyToken, getOrdersByUserId);

router.get("/get-all-orders", verifyToken, getAllOrders);

router.get("/get-metrics", verifyToken, getMetrics);

router.put("/update-order-status/:orderId", verifyToken, updateOrderStatus);

router.post("/orders/create", verifyToken, createOrder);

router.get("/track/:id", verifyToken, trackShipment);
router.get("/orders/:orderId/track", verifyToken, trackShipment);
router.get("/orders/:orderId/shiprocket/label", verifyToken, getShiprocketLabel);
router.get("/orders/:orderId/shiprocket/invoice", verifyToken, getShiprocketInvoice);

router.post("/cancel-order", verifyToken, cancelOrder);
router.post("/admin/orders/:id/assign-courier", verifyToken, assignCourierController);
router.post("/admin/orders/:id/create-shipment", verifyToken, createShipmentForOrder);
router.post("/admin/orders/:id/refresh-shiprocket-docs", verifyToken, refreshShiprocketDocs);
router.get("/orders/:orderId", verifyToken, getOrdersByOrderId);
module.exports = router;
