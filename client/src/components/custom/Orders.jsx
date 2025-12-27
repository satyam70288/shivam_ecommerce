import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import useErrorLogout from "@/hooks/use-error-logout";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, ChevronUp } from "lucide-react";
import { formatDate, getStatusColor } from "@/utils/orderHelpers";
const getPaymentStatusColor = (status) => {
  switch (status) {
    case "PAID":
      return "text-green-600 dark:text-green-400";
    case "PENDING":
      return "text-yellow-600 dark:text-yellow-400";
    case "FAILED":
      return "text-red-600 dark:text-red-400";
    default:
      return "text-gray-600 dark:text-gray-400";
  }
};
const formatShortDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState(new Set());

  const { handleErrorLogout } = useErrorLogout();
  const { toast } = useToast();

  /* ================= FETCH ORDERS ================= */
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/get-all-orders`,
          {
            params: {
              page: currentPage,
              limit: 10,
            },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setOrders(res.data.data);
        setTotalPages(res.data.pagination.totalPages);
      } catch (error) {
        handleErrorLogout(error, error.response?.data?.message);
      }
    };

    fetchOrders();
  }, [currentPage]);

  /* ================= UPDATE ORDER STATUS ================= */
  const updateOrderStatus = async (newStatus, orderId) => {
    if (!window.confirm(`Change order status to "${newStatus}"?`)) {
      return;
    }

    let reason = "";
    if (newStatus === "CANCELLED") {
      reason = window.prompt("Please enter cancellation reason:");
      if (reason === null) return;
      if (!reason?.trim()) {
        toast({
          title: "Error",
          description: "Cancellation reason is required",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/update-order-status/${orderId}`,
        {
          status: newStatus,
          ...(reason && { reason }),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId
              ? {
                  ...order,
                  status: newStatus,
                  ...(reason && { cancelReason: reason }),
                  ...(newStatus === "DELIVERED" && { deliveredAt: new Date() }),
                }
              : order
          )
        );

        toast({
          title: "Success",
          description: `Order status updated to ${newStatus}`,
        });
      }
    } catch (error) {
      console.error("Update error:", error);

      if (error.response?.status === 400) {
        const message =
          error.response.data.message || "Invalid status transition";
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      } else if (error.response?.status === 403) {
        toast({
          title: "Access Denied",
          description: "You are not authorized to update order status",
          variant: "destructive",
        });
      } else if (error.response?.status === 404) {
        toast({
          title: "Not Found",
          description: "Order not found",
          variant: "destructive",
        });
      } else if (error.response?.status === 500) {
        toast({
          title: "Server Error",
          description: "Please try again later",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update order status",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= TOGGLE STATUS HISTORY ================= */
  const toggleStatusHistory = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  /* ================= FORMAT SHORT DATE ================= */
  
  /* ================= RENDER ================= */
  return (
    <>
      <div className="flex justify-between items-center mb-6 px-3">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Orders
        </h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Total: {orders.length} orders
          {loading && <span className="ml-2 animate-pulse">• Updating...</span>}
        </div>
      </div>

      <div className="flex flex-col gap-6 max-w-7xl mx-auto px-2">
        {orders.length === 0 ? (
          <h2 className="text-gray-500 dark:text-gray-400 text-xl ml-3">
            No orders found
          </h2>
        ) : (
          orders.map((order) => (
            <Card
              key={order._id}
              className="p-5 rounded-2xl shadow-sm dark:shadow-gray-800/20 border border-gray-200 dark:border-gray-800 space-y-4 hover:shadow-md dark:hover:shadow-gray-800/30 transition-shadow bg-white dark:bg-gray-900"
            >
              {/* HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Order ID
                  </p>
                  <p className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
                    #{order._id?.slice(-8)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(order.createdAt)}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <OrderAmount amount={order.totalAmount} />
                  <OrderStatusSelector
                    order={order}
                    loading={loading}
                    updateOrderStatus={updateOrderStatus}
                  />
                </div>
              </div>

              {/* Cancellation Reason */}
              {order.cancelReason && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-md">
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">
                    Cancellation Reason:
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {order.cancelReason}
                  </p>
                </div>
              )}

              {/* STATUS HISTORY PREVIEW */}
              <div className="space-y-3">
                <StatusHistoryHeader
                  historyLength={order.statusHistory.length}
                  orderId={order._id}
                  expandedOrders={expandedOrders}
                  toggleStatusHistory={toggleStatusHistory}
                />

                {/* Recent Status (Always Visible) */}
                <div className="space-y-2">
                  {order.statusHistory.slice(-1).map((change, index) => (
                    <RecentStatusItem key={index} change={change} />
                  ))}
                </div>

                {/* Expanded Status History */}
                {expandedOrders.has(order._id) && (
                  <ExpandedStatusHistory statusHistory={order.statusHistory} />
                )}
              </div>

              <hr className="border-gray-200 dark:border-gray-800" />

              {/* PRODUCTS */}
              <div>
                <p className="font-medium mb-3 text-gray-900 dark:text-white">
                  Products ({order.items.length})
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {order.items.map((product, index) => (
                    <ProductCard product={product} />
                  ))}
                </div>
              </div>

              <hr className="border-gray-200 dark:border-gray-800" />

              {/* INFO GRID */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Customer Info */}
                <CustomerInfo user={order.user} />
                {/* Shipping Address */}
                <ShippingAddress address={order.address} />

                {/* Payment Info */}
                <PaymentInfo payment={order.payment} />
              </div>
            </Card>
          ))
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50 text-gray-400 dark:text-gray-600"
                        : "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                    }
                  />
                </PaginationItem>

                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <PaginationItem key={i}>
                      <PaginationLink
                        isActive={currentPage === pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 data-[active]:bg-gray-200 dark:data-[active]:bg-gray-700 data-[active]:text-gray-900 dark:data-[active]:text-white"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                {totalPages > 5 && (
                  <>
                    <PaginationItem>
                      <PaginationEllipsis className="text-gray-500 dark:text-gray-400" />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        isActive={currentPage === totalPages}
                        onClick={() => setCurrentPage(totalPages)}
                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 data-[active]:bg-gray-200 dark:data-[active]:bg-gray-700 data-[active]:text-gray-900 dark:data-[active]:text-white"
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50 text-gray-400 dark:text-gray-600"
                        : "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>

            <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
              Page {currentPage} of {totalPages} • {orders.length} orders per
              page
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Orders;

const ProductCard = ({ product }) => (
  <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-3 bg-gray-50/50 dark:bg-gray-800/50">
    <div className="flex items-start gap-3">
      <img
        src={product.image}
        alt={product.name}
        className="w-16 h-16 object-cover rounded"
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/64?text=No+Image";
        }}
      />
      <div>
        <p className="font-medium text-sm line-clamp-1 text-gray-900 dark:text-white">
          {product.name}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Qty: {product.quantity}
        </p>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          ₹{product.price}
        </p>
        {product.color && product.color !== "Default" && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Color: {product.color}
          </p>
        )}
      </div>
    </div>
  </div>
);

const CustomerInfo = ({ user }) => (
  <div className="space-y-2">
    <p className="font-semibold text-sm text-gray-900 dark:text-white">
      Customer Details
    </p>
    <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
      <p className="font-medium text-gray-900 dark:text-white">{user?.name}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
    </div>
  </div>
);

const ShippingAddress = ({ address }) => (
  <div className="space-y-2">
    <p className="font-semibold text-sm text-gray-900 dark:text-white">
      Shipping Address
    </p>
    <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
      <p className="font-medium text-gray-900 dark:text-white">
        {address?.name}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {address?.phone}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {address?.addressLine1}
        {address?.addressLine2 && `, ${address.addressLine2}`}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {address?.city}, {address?.state} - {address?.pincode}
      </p>
    </div>
  </div>
);

const PaymentInfo = ({ payment }) => (
  <div className="space-y-2">
    <p className="font-semibold text-sm text-gray-900 dark:text-white">
      Payment Details
    </p>
    <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Method:
        </span>
        <span className="font-medium capitalize text-gray-900 dark:text-white">
          {payment?.method}
        </span>
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Status:
        </span>
        <span
          className={`font-medium ${getPaymentStatusColor(payment?.status)}`}
        >
          {payment?.status}
        </span>
      </div>
      {payment?.paymentId && (
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Payment ID:
          </p>
          <p className="text-xs font-mono truncate text-gray-900 dark:text-gray-300">
            {payment.paymentId}
          </p>
        </div>
      )}
    </div>
  </div>
);

const OrderStatusSelector = ({ order, loading, updateOrderStatus }) => {
  const statusOptions = [
    { value: "PLACED", label: "Placed" },
    { value: "CONFIRMED", label: "Confirmed" },
    { value: "PACKED", label: "Packed" },
    { value: "SHIPPED", label: "Shipped" },
    { value: "DELIVERED", label: "Delivered" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  return (
    <div className="flex items-center gap-2">
      {/* Status Badge */}
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
          order.status
        )}`}
      >
        {order.status}
      </span>

      {/* Status Selector */}
      <Select
        value={order.status}
        onValueChange={(value) => updateOrderStatus(value, order._id)}
        disabled={loading}
      >
        <SelectTrigger className="w-[150px] capitalize bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="capitalize bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
          {statusOptions.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="focus:bg-gray-100 dark:focus:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

const OrderAmount = ({ amount }) => (
  <div className="text-right">
    <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
    <p className="text-lg font-bold text-gray-900 dark:text-white">₹{amount}</p>
  </div>
);

const StatusHistoryHeader = ({
  historyLength,
  orderId,
  expandedOrders,
  toggleStatusHistory,
}) => (
  <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
    <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
      Status History{" "}
      <span className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs font-normal ml-1">
        {historyLength} updates
      </span>
    </h4>
    
    <button
      onClick={() => toggleStatusHistory(orderId)}
      className="flex items-center justify-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 w-full xs:w-auto px-3 py-1.5 xs:px-0 xs:py-0 bg-blue-50 dark:bg-blue-900/20 xs:bg-transparent xs:dark:bg-transparent rounded-md xs:rounded-none border border-blue-100 dark:border-blue-800/30 xs:border-0"
    >
      {expandedOrders.has(orderId) ? (
        <>
          <ChevronUp className="w-4 h-4" />
          <span className="xs:hidden">Hide History</span>
          <span className="hidden xs:inline">Hide Details</span>
        </>
      ) : (
        <>
          <ChevronDown className="w-4 h-4" />
          <span className="xs:hidden">Show History</span>
          <span className="hidden xs:inline">Show Details</span>
        </>
      )}
    </button>
  </div>
);

const RecentStatusItem = ({ change }) => (
  <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
    <div>
      <span className="text-sm font-medium capitalize">{change.status}</span>
      {change.reason && (
        <p className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-xs">
          {change.reason}
        </p>
      )}
    </div>
    <span className="text-xs text-gray-500 dark:text-gray-400">
      {formatShortDate(change.changedAt)}
    </span>
  </div>
);

const StatusHistoryItem = ({ change }) => {
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "SHIPPED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="pb-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 last:pb-0">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeClass(
                change.status
              )}`}
            >
              {change.status}
            </span>
            {change.changedBy?.name && (
              <span className="text-xs text-gray-600 dark:text-gray-400">
                by {change.changedBy.name}
              </span>
            )}
          </div>
          {change.reason && (
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
              {change.reason}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(change.changedAt).toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {new Date(change.changedAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

const ExpandedStatusHistory = ({ statusHistory }) => (
  <div className="mt-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-800/30">
    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
      {statusHistory.map((change, index) => (
        <StatusHistoryItem key={index} change={change} />
      ))}
    </div>
  </div>
);
