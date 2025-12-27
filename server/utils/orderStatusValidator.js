// utils/orderStatusValidator.js
// COMPLETE VERSION WITH ALL ERROR MESSAGES

const VALID_TRANSITIONS = {
  PLACED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PACKED", "CANCELLED"],
  PACKED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "CANCELLED"],
  DELIVERED: ["RETURNED"],
  CANCELLED: [], // Once cancelled, no further changes
  RETURNED: []   // Once returned, no further changes
};

const ERROR_MESSAGES = {
  "PLACED → PLACED": "Order is already placed",
  "CONFIRMED → CONFIRMED": "Order is already confirmed",
  "PACKED → PACKED": "Order is already packed",
  "SHIPPED → SHIPPED": "Order is already shipped",
  "DELIVERED → DELIVERED": "Order is already delivered",
  "CANCELLED → CANCELLED": "Order is already cancelled",
  "RETURNED → RETURNED": "Order is already returned",
  
  "PLACED → PACKED": "Order must be confirmed before packing",
  "PLACED → SHIPPED": "Order must be confirmed and packed before shipping",
  "PLACED → DELIVERED": "Invalid status flow",
  "PLACED → RETURNED": "Cannot return an order that hasn't been delivered",
  
  "CONFIRMED → PLACED": "Cannot revert to placed status",
  "CONFIRMED → SHIPPED": "Order must be packed before shipping",
  "CONFIRMED → DELIVERED": "Invalid status flow",
  "CONFIRMED → RETURNED": "Cannot return an order that hasn't been delivered",
  
  "PACKED → PLACED": "Cannot revert to placed status",
  "PACKED → CONFIRMED": "Cannot revert to confirmed status",
  "PACKED → DELIVERED": "Order must be shipped before delivery",
  "PACKED → RETURNED": "Cannot return an order that hasn't been delivered",
  
  "SHIPPED → PLACED": "Cannot revert to placed status",
  "SHIPPED → CONFIRMED": "Cannot revert to confirmed status",
  "SHIPPED → PACKED": "Cannot revert to packed status",
  "SHIPPED → RETURNED": "Cannot return an order that hasn't been delivered",
  
  "DELIVERED → PLACED": "Cannot revert to placed status",
  "DELIVERED → CONFIRMED": "Cannot revert to confirmed status",
  "DELIVERED → PACKED": "Cannot revert to packed status",
  "DELIVERED → SHIPPED": "Delivered orders cannot be shipped again",
  "DELIVERED → CANCELLED": "Delivered orders cannot be cancelled",
  
  "CANCELLED → PLACED": "Cancelled orders cannot be reactivated",
  "CANCELLED → CONFIRMED": "Cancelled orders cannot be confirmed",
  "CANCELLED → PACKED": "Cancelled orders cannot be packed",
  "CANCELLED → SHIPPED": "Cancelled orders cannot be shipped",
  "CANCELLED → DELIVERED": "Cancelled orders cannot be delivered",
  "CANCELLED → RETURNED": "Cancelled orders cannot be returned",
  
  "RETURNED → PLACED": "Returned orders cannot be reactivated",
  "RETURNED → CONFIRMED": "Returned orders cannot be confirmed",
  "RETURNED → PACKED": "Returned orders cannot be packed",
  "RETURNED → SHIPPED": "Returned orders cannot be shipped",
  "RETURNED → DELIVERED": "Returned orders cannot be delivered",
  "RETURNED → CANCELLED": "Returned orders cannot be cancelled"
};

const validateStatusTransition = (fromStatus, toStatus) => {
  // Same status is always valid (no error)
  if (fromStatus === toStatus) {
    return { isValid: true, message: "" };
  }

  // Check if transition exists in valid transitions
  const allowedTransitions = VALID_TRANSITIONS[fromStatus] || [];
  
  if (allowedTransitions.includes(toStatus)) {
    return { isValid: true, message: "" };
  }

  // Generate error message
  const transitionKey = `${fromStatus} → ${toStatus}`;
  const message = ERROR_MESSAGES[transitionKey] || 
                 `Cannot change status from ${fromStatus} to ${toStatus}`;
  
  return { isValid: false, message };
};

const canCancelOrder = (status) => {
  return ["PLACED", "CONFIRMED"].includes(status);
};

const canReturnOrder = (status) => {
  return status === "DELIVERED";
};

const getNextPossibleStatuses = (status) => {
  return VALID_TRANSITIONS[status] || [];
};

const getDefaultReason = (status) => {
  const reasons = {
    PLACED: "Order placed by customer",
    CONFIRMED: "Payment confirmed by system",
    PACKED: "Order packed by warehouse",
    SHIPPED: "Order picked up by courier",
    DELIVERED: "Order delivered to customer",
    CANCELLED: "Order cancelled by customer",
    RETURNED: "Order returned by customer"
  };
  return reasons[status] || "Status updated";
};

const validateAndUpdateOrderStatus = (order, newStatus, userId, reason = "") => {
  try {
    // Validate the transition
    const { isValid, message } = validateStatusTransition(order.status, newStatus);
    
    if (!isValid) {
      return { success: false, error: message };
    }

    // Initialize statusHistory if not exists
    if (!order.statusHistory) {
      order.statusHistory = [];
    }

    // Add initial status entry if history is empty
    if (order.statusHistory.length === 0) {
      order.statusHistory.push({
        fromStatus: null,
        toStatus: order.status,
        changedAt: order.createdAt || new Date(),
        changedBy: userId,
        reason: "Order created"
      });
    }

    // Add new status entry to history
    order.statusHistory.push({
      fromStatus: order.status,
      toStatus: newStatus,
      changedAt: new Date(),
      changedBy: userId,
      reason: reason || getDefaultReason(newStatus)
    });

    // Update current status
    const oldStatus = order.status;
    order.status = newStatus;
    order.updatedAt = new Date();

    // Update specific fields based on status
    if (newStatus === "DELIVERED") {
      order.deliveredAt = new Date();
    } else if (newStatus === "CANCELLED") {
      order.cancelReason = reason || "No reason provided";
    } else if (newStatus === "RETURNED") {
      order.returnReason = reason || "No reason provided";
    }

    return { 
      success: true, 
      updatedOrder: order,
      oldStatus,
      newStatus 
    };

  } catch (error) {
    return { 
      success: false, 
      error: error.message || "Unknown error during status update" 
    };
  }
};

// Get status flow timeline for UI display
const getStatusTimeline = (statusHistory) => {
  const timeline = [];
  
  if (!statusHistory || statusHistory.length === 0) {
    return timeline;
  }

  // Sort by date
  const sortedHistory = [...statusHistory].sort((a, b) => 
    new Date(a.changedAt) - new Date(b.changedAt)
  );

  // Create timeline steps
  sortedHistory.forEach((entry, index) => {
    timeline.push({
      step: index + 1,
      status: entry.toStatus,
      date: entry.changedAt,
      reason: entry.reason,
      isCompleted: true,
      isCurrent: index === sortedHistory.length - 1
    });
  });

  return timeline;
};

// Get estimated time for next status (for UI)
const getEstimatedTimeForNextStatus = (currentStatus) => {
  const estimates = {
    PLACED: "1-2 hours",
    CONFIRMED: "24 hours",
    PACKED: "12-24 hours",
    SHIPPED: "2-5 days",
    DELIVERED: "Already delivered",
    CANCELLED: "N/A",
    RETURNED: "N/A"
  };
  
  return estimates[currentStatus] || "Unknown";
};

// Check if order is in active state (not cancelled or returned)
const isOrderActive = (status) => {
  return !["CANCELLED", "RETURNED"].includes(status);
};

// Check if order is completed (delivered, cancelled or returned)
const isOrderCompleted = (status) => {
  return ["DELIVERED", "CANCELLED", "RETURNED"].includes(status);
};

// Get status display name with icon (for UI)
const getStatusDisplayInfo = (status) => {
  const statusInfo = {
    PLACED: {
      name: "Order Placed",
      icon: "📝",
      color: "blue",
      description: "Your order has been received"
    },
    CONFIRMED: {
      name: "Confirmed",
      icon: "✅",
      color: "green",
      description: "Payment confirmed, processing order"
    },
    PACKED: {
      name: "Packed",
      icon: "📦",
      color: "purple",
      description: "Items packed and ready to ship"
    },
    SHIPPED: {
      name: "Shipped",
      icon: "🚚",
      color: "orange",
      description: "Order is on the way to you"
    },
    DELIVERED: {
      name: "Delivered",
      icon: "🎁",
      color: "green",
      description: "Order has been delivered"
    },
    CANCELLED: {
      name: "Cancelled",
      icon: "❌",
      color: "red",
      description: "Order has been cancelled"
    },
    RETURNED: {
      name: "Returned",
      icon: "↩️",
      color: "gray",
      description: "Order has been returned"
    }
  };
  
  return statusInfo[status] || {
    name: status,
    icon: "❓",
    color: "gray",
    description: "Unknown status"
  };
};

// Calculate percentage completion for progress bar
const getOrderProgressPercentage = (status) => {
  const progressMap = {
    PLACED: 20,
    CONFIRMED: 40,
    PACKED: 60,
    SHIPPED: 80,
    DELIVERED: 100,
    CANCELLED: 100,
    RETURNED: 100
  };
  
  return progressMap[status] || 0;
};

// Export as CommonJS module
module.exports = {
  // Core validation functions
  validateStatusTransition,
  canCancelOrder,
  canReturnOrder,
  getNextPossibleStatuses,
  validateAndUpdateOrderStatus,
  
  // UI helper functions
  getStatusTimeline,
  getEstimatedTimeForNextStatus,
  getStatusDisplayInfo,
  getOrderProgressPercentage,
  
  // Status check functions
  isOrderActive,
  isOrderCompleted,
  
  // Constants
  VALID_TRANSITIONS,
  ERROR_MESSAGES,
  
  // For testing/development
  _getDefaultReason: getDefaultReason
};