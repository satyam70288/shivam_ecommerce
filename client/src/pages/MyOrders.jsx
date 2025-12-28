import OrderData from "@/components/custom/OrderData";
import useErrorLogout from "@/hooks/use-error-logout";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [expandedOrderId, setExpandedOrderId] = useState(null); // Track expanded order
  const { handleErrorLogout } = useErrorLogout();
 const navigate = useNavigate();

  const viewOrderDetails = (orderId) => {
    navigate(`/orders/${orderId}`);
  };
  // Filter logic
  useEffect(() => {
    const filterOrders = () => {
      if (activeFilter === "ALL") {
        setFilteredOrders(orders);
      } else {
        const filtered = orders.filter(
          (order) => order.status === activeFilter
        );
        setFilteredOrders(filtered);
      }
    };

    filterOrders();
  }, [activeFilter, orders]);

  // Database ke hisaab se status filters
  const statusFilters = [
    { id: "ALL", label: "All Orders", dbStatus: null },
    { id: "PLACED", label: "Placed", dbStatus: "PLACED" },
    { id: "CONFIRMED", label: "Confirmed", dbStatus: "CONFIRMED" },
    { id: "PACKED", label: "Packed", dbStatus: "PACKED" },
    { id: "SHIPPED", label: "Shipped", dbStatus: "SHIPPED" },
    { id: "DELIVERED", label: "Delivered", dbStatus: "DELIVERED" },
    { id: "CANCELLED", label: "Cancelled", dbStatus: "CANCELLED" },
    { id: "RETURNED", label: "Returned", dbStatus: "RETURNED" },
  ];

  useEffect(() => {
    const getMyOrders = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/get-orders-by-user-id`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const normalizedOrders = (res.data.data || []).map((order) => ({
          _id: order.orderId,
          createdAt: order.date,
          status: order.status || "PLACED",
          amount: order.amount || 0,
          products: order.products || [],
          orderNumber:
            order.orderNumber || `#${order.orderId?.slice(-12)?.toUpperCase()}`,
          paymentMethod: order.paymentMethod || "Cash on Delivery",
        }));

        setOrders(normalizedOrders);
      } catch (error) {
        console.error("MyOrders error:", error);
        handleErrorLogout(error);
      } finally {
        setLoading(false);
      }
    };

    getMyOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/cancel-order`,
        { orderId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setOrders((prev) => prev.filter((order) => order._id !== orderId));
      alert("Order cancelled successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to cancel order");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  // Status badge with professional styling
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      PLACED: {
        text: "Placed",
        bg: "bg-[#FFF4E5]",
        textColor: "text-[#B86E00]",
        border: "border-[#FFD699]",
      },
      CONFIRMED: {
        text: "Confirmed",
        bg: "bg-[#E8F4FF]",
        textColor: "text-[#0A5FD9]",
        border: "border-[#B3D7FF]",
      },
      PACKED: {
        text: "Packed",
        bg: "bg-[#F3E5F5]",
        textColor: "text-[#7B1FA2]",
        border: "border-[#E1BEE7]",
      },
      SHIPPED: {
        text: "Shipped",
        bg: "bg-[#FFEDE6]",
        textColor: "text-[#D04A00]",
        border: "border-[#FFC9B3]",
      },
      DELIVERED: {
        text: "Delivered",
        bg: "bg-[#E8F5E9]",
        textColor: "text-[#1B5E20]",
        border: "border-[#C8E6C9]",
      },
      CANCELLED: {
        text: "Cancelled",
        bg: "bg-[#FFEBEE]",
        textColor: "text-[#C62828]",
        border: "border-[#FFCDD2]",
      },
      RETURNED: {
        text: "Returned",
        bg: "bg-[#FFF3E0]",
        textColor: "text-[#EF6C00]",
        border: "border-[#FFE0B2]",
      },
    };

    const config = statusConfig[status] || statusConfig.PLACED;

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.textColor} ${config.border} border`}
      >
        {config.text}
      </span>
    );
  };

  // Tab change handler
  const handleTabChange = (filterId) => {
    setActiveFilter(filterId);
    setExpandedOrderId(null); // Close any expanded order when changing filter
  };

  // Count orders for each filter
  const getOrderCount = (filterId) => {
    if (filterId === "ALL") return orders.length;

    return orders.filter((order) => order.status === filterId).length;
  };

  // Toggle order details
  const toggleOrderDetails = (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null); // Close if already open
    } else {
      setExpandedOrderId(orderId); // Open this order
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] dark:bg-[#0F172A]">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Loading skeleton */}
            {/* ... existing loading skeleton ... */}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] dark:bg-[#0F172A] transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              My Orders
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track and manage all your orders in one place
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Filter by Status
              </p>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {filteredOrders.length} orders
              </span>
            </div>

            <div className="flex space-x-2 sm:space-x-0 sm:flex-wrap gap-2 overflow-x-auto sm:overflow-visible scrollbar-hide px-1 py-2">
              {statusFilters.map((filter) => {
                const count = getOrderCount(filter.id);
                const isActive = activeFilter === filter.id;

                return (
                  <button
                    key={filter.id}
                    onClick={() => handleTabChange(filter.id)}
                    className={`group relative flex-shrink-0 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 sm:scale-105"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <span className="relative z-10 text-sm sm:text-base whitespace-nowrap">
                      {filter.label}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full min-w-[28px] text-center ${
                        isActive
                          ? "bg-white/20 text-white"
                          : count === 0
                          ? "bg-gray-100/50 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Orders List - FLIPKART STYLE */}
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-gray-400 dark:text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {activeFilter === "ALL"
                      ? "No orders found"
                      : `No ${activeFilter.toLowerCase()} orders`}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8">
                    {activeFilter === "ALL"
                      ? "You haven't placed any orders yet. Start shopping!"
                      : `You don't have any ${activeFilter.toLowerCase()} orders.`}
                  </p>
                  <button
                    onClick={() =>
                      activeFilter !== "ALL" && handleTabChange("ALL")
                    }
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95"
                  >
                    {activeFilter === "ALL"
                      ? "Start Shopping"
                      : "View All Orders"}
                  </button>
                </div>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  {/* Order Header - Summary View */}
                  <div className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left Side: Order Info */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <StatusBadge status={order.status} />
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(order.createdAt)}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            Order {order.orderNumber}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {order.products.length} item
                            {order.products.length !== 1 ? "s" : ""}
                          </p>
                        </div>

                        {/* Product Images - Flipkart Style */}
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-3">
                            {order.products.slice(0, 3).map((product, idx) => (
                              <img
                                key={idx}
                                src={product.image || "/placeholder.png"}
                                alt={product.name}
                                className="w-10 h-10 rounded-lg border-2 border-white dark:border-gray-800 object-cover bg-gray-100 dark:bg-gray-700"
                              />
                            ))}
                            {order.products.length > 3 && (
                              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
                                +{order.products.length - 3}
                              </div>
                            )}
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            • {order.paymentMethod}
                          </span>
                        </div>
                      </div>

                      {/* Right Side: Amount & Actions */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {formatPrice(order.amount)}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Total Amount
                          </p>
                        </div>

                        <div className="flex gap-2">
                          {/* Track Order Button */}
                          {order.status === "SHIPPED" && (
                            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                              Track Order
                            </button>
                          )}

                          {/* View Details Button */}
                          <button
                            onClick={() => viewOrderDetails(order._id)}
                            className="px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/20 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                          >
                            {expandedOrderId === order._id ? (
                              <>
                                <ChevronUp className="w-4 h-4" />
                                Hide Details
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4" />
                                View Details
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Order Details - Shows only when clicked */}
                  {expandedOrderId === order._id && (
                    <div className="border-t border-gray-100 dark:border-gray-700">
                      <div className="p-4 md:p-6">
                        <OrderData
                          {...order}
                          onCancel={() => handleCancelOrder(order._id)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer Help Section */}
          {orders.length > 0 && (
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      Need Help with Your Orders?
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Our support team is available 24/7 to assist you
                    </p>
                  </div>
                </div>
                <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg whitespace-nowrap">
                  Contact Support
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;