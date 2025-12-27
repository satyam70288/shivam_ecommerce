// src/constants/orderConstants.js

// Status filters for MyOrders component
export const STATUS_FILTERS = [
  { id: "ALL", label: "All Orders", dbStatus: null },
  { id: "PLACED", label: "Placed", dbStatus: "PLACED" },
  { id: "CONFIRMED", label: "Confirmed", dbStatus: "CONFIRMED" },
  { id: "PACKED", label: "Packed", dbStatus: "PACKED" },
  { id: "SHIPPED", label: "Shipped", dbStatus: "SHIPPED" },
  { id: "DELIVERED", label: "Delivered", dbStatus: "DELIVERED" },
  { id: "CANCELLED", label: "Cancelled", dbStatus: "CANCELLED" },
  { id: "RETURNED", label: "Returned", dbStatus: "RETURNED" },
];

// Order status flow
export const ORDER_STATUS_FLOW = [
  "PLACED",
  "CONFIRMED", 
  "PACKED",
  "SHIPPED",
  "DELIVERED"
];

// Status display names
export const STATUS_DISPLAY_NAMES = {
  PLACED: "Placed",
  CONFIRMED: "Confirmed",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned"
};

// Payment methods
export const PAYMENT_METHODS = {
  COD: "Cash on Delivery",
  CARD: "Credit/Debit Card",
  UPI: "UPI",
  NETBANKING: "Net Banking",
  WALLET: "Wallet"
};