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
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
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
            {error || "The order you're looking for doesn't exist or you don't have access."}
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
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Order #{order.orderNumber || order._id.slice(-8).toUpperCase()}
                  </h1>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₹{order.amount.toLocaleString("en-IN")}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Amount
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Order Content */}
          <OrderData
            {...order}
            onCancel={handleCancelOrder}
          />

          {/* Additional Order Info (Address, Payment, etc.) */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shipping Address */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Shipping Address
              </h3>
              {order.shippingAddress ? (
                <div className="text-gray-600 dark:text-gray-400">
                  <p className="font-medium">{order.shippingAddress.name}</p>
                  <p>{order.shippingAddress.street}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
                  <p className="mt-2">Phone: {order.shippingAddress.phone}</p>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Address information not available</p>
              )}
            </div>

            {/* Payment Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Payment Information
              </h3>
              <div className="text-gray-600 dark:text-gray-400">
                <p className="font-medium">{order.paymentMethod || "Cash on Delivery"}</p>
                <p className="mt-2">Status: <span className="text-green-600 dark:text-green-400 font-medium">Paid</span></p>
                <p className="mt-4 text-sm">Transaction ID: {order.transactionId || "Not Available"}</p>
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