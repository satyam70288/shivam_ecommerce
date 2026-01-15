const Order = require("../models/Order");

/**
 * Central Order + Shipping Status Manager
 */
async function updateOrderStatus(orderId, {
  orderStatus,
  shippingStatus,
  reason
}) {
  if (!orderId) throw new Error("Order ID is required");

  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");

  const update = {};
  const history = {};

  // ✅ Business status update
  if (orderStatus) {
    update.orderStatus = orderStatus;
    history.orderStatus = orderStatus;
  }

  // ✅ Shipping status update
  if (shippingStatus) {
    update.shippingStatus = shippingStatus;
    history.shippingStatus = shippingStatus;
  }

  // ✅ Push history entry
  history.reason = reason || "Status updated";
  history.changedAt = new Date();

  await Order.findByIdAndUpdate(orderId, {
    ...update,
    $push: {
      statusHistory: history
    }
  });

  return {
    success: true,
    message: "Order status updated successfully",
    orderStatus,
    shippingStatus
  };
}

module.exports = { updateOrderStatus };
