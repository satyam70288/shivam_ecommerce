// src/pages/OrderDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Home, Package, IndianRupee, Calendar } from "lucide-react";
import OrderData from "@/components/custom/OrderData";
import useErrorLogout from "@/hooks/use-error-logout";

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { handleErrorLogout } = useErrorLogout();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/orders/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setOrder(res.data.data);
      } catch (error) {
        console.error("OrderDetails error:", error);
        setError("Order not found or access denied");
        handleErrorLogout(error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const handleCancelOrder = async () => {
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
      alert("Order cancelled successfully");
      navigate("/orders");
    } catch (error) {
      console.error(error);
      alert("Failed to cancel order");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Loading skeleton */}
          <div className="max-w-4xl mx-auto">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
            <Package className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Order Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error ||
              "The order you're looking for doesn't exist or you don't have access."}
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/orders"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Back to Orders
            </Link>
            <Link
              to="/"
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header with Back Navigation */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => navigate("/orders")}
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Orders
              </button>
              <Link
                to="/"
                className="ml-auto flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                <Home className="w-5 h-5" />
                Home
              </Link>
            </div>

            {/* Order Header Info */}
           <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 mb-6">
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
    {/* Left: Order Info */}
    <div className="flex-1">
      <div className="flex items-start gap-4">
        {/* Order Icon */}
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>

        {/* Order Details */}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            Order #{order.orderNumber || order._id.slice(-8).toUpperCase()}
          </h1>
          
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                order.status === "DELIVERED"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                  : order.status === "CANCELLED"
                  ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${
                order.status === "DELIVERED" ? "bg-green-500" :
                order.status === "CANCELLED" ? "bg-red-500" :
                "bg-blue-500"
              }`}></span>
              {order.status}
            </div>
          </div>

          {/* Payment Info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span>{order.paymentMethod || "COD"}</span>
            </div>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {order.products?.length || 0} items
            </span>
          </div>
        </div>
      </div>
    </div>

    {/* Right: Amount */}
    <div className="md:text-right">
      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        ₹{order.amount.toLocaleString("en-IN")}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
        <div className="flex items-center gap-2 justify-end">
          <span>Items: ₹{order.subtotal?.toLocaleString("en-IN")}</span>
          {order.shippingCharge > 0 && (
            <>
              <span className="text-gray-400">+</span>
              <span>Shipping: ₹{order.shippingCharge?.toLocaleString("en-IN")}</span>
            </>
          )}
        </div>
        {order.shippingCharge === 0 && (
          <div className="text-green-600 dark:text-green-400 text-xs font-medium">
            Free shipping applied
          </div>
        )}
      </div>
    </div>
  </div>
</div>
          </div>


          {/* Main Order Content */}
          <OrderData
            products={order.products} // ✅ order.products use karein
            amount={order.amount} // ✅ order.amount hai, totalAmount nahi
            subtotal={order.subtotal}
            shippingCharge={order.shippingCharge}
            status={order.status}
            createdAt={order.createdAt} // ✅ Add this
            _id={order._id}
            onCancel={handleCancelOrder}
          />

          {/* Additional Order Info (Address, Payment, etc.) */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shipping Address */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Shipping Address
              </h3>
              {order.shippingAddress ? (
                <div className="text-gray-600 dark:text-gray-400">
                  <p className="font-medium">{order.shippingAddress.name}</p>
                  <p>{order.shippingAddress.street}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    {order.shippingAddress.pincode}
                  </p>
                  <p className="mt-2">Phone: {order.shippingAddress.phone}</p>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  Address information not available
                </p>
              )}
            </div>

            {/* Payment Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                Payment Information
              </h3>
              <div className="text-gray-600 dark:text-gray-400">
                <p className="font-medium">
                  {order.paymentMethod || "Cash on Delivery"}
                </p>
                <p className="mt-2">
                  Status:{" "}
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    {order.paymentStatus}
                  </span>
                </p>
                <p className="mt-4 text-sm">
                  Transaction ID: {order.transactionId || "Not Available"}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/orders"
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
            >
              Back to All Orders
            </Link>
            <button
              onClick={() => window.print()}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              Print Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
