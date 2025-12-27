import OrderData from "@/components/custom/OrderData";
import useErrorLogout from "@/hooks/use-error-logout";
import axios from "axios";
import React, { useEffect, useState } from "react";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const { handleErrorLogout } = useErrorLogout();

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

  // Database ke hisaab se status filters (UPPERCASE)
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
          // Database se jo status aaye, use as it is (UPPERCASE)
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

  // Status badge with professional styling - UPPERCASE ke liye
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
  };

  // Count orders for each filter
  const getOrderCount = (filterId) => {
    if (filterId === "ALL") return orders.length;

    return orders.filter((order) => order.status === filterId).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] dark:bg-[#0F172A]">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="h-8 w-64 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 rounded-lg mb-8 animate-pulse"></div>

            <div className="flex gap-3 mb-8 overflow-x-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="h-12 w-28 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 rounded-lg animate-pulse flex-shrink-0"
                ></div>
              ))}
            </div>

            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-40 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl mb-4 animate-pulse"
              ></div>
            ))}
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
          

          {/* Stats Bar */}
          

          {/* Filter Tabs - Premium Design */}
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
                    {isActive && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full animate-pulse"></span>
                    )}
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

          {/* Orders List */}
          <div className="space-y-6">
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
                  className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500"
                >
                  {/* Order Header with Gradient */}
                  <div className="relative p-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
          
                        <div className="flex items-center gap-3">
                          <StatusBadge status={order.status} />
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            • {order.paymentMethod}
                          </span>
                        </div>
                      </div>
                      
                    </div>
                  </div>

                  {/* Order Content */}
                  <div className="p-6">
                    <OrderData
                      {...order}
                      onCancel={() => handleCancelOrder(order._id)}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Help Section */}
          {orders.length > 0 && (
            <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 border border-blue-100 dark:border-blue-800">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                    <svg
                      className="w-7 h-7 text-white"
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
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      Need Help with Your Orders?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Our support team is available 24/7 to assist you
                    </p>
                  </div>
                </div>
                <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 whitespace-nowrap">
                  Contact Support
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add custom font via Google Fonts (Poppins) */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap");

        body {
          font-family: "Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #1d4ed8);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #1e40af);
        }

        .dark ::-webkit-scrollbar-track {
          background: #1f2937;
        }

        .dark ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #60a5fa, #3b82f6);
        }

        .dark ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #93c5fd, #60a5fa);
        }
      `}</style>
    </div>
  );
};

export default MyOrders;
