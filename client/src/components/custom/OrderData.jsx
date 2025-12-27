// src/components/custom/OrderData.jsx
import React, { useState } from "react";
import { IndianRupee, Calendar } from "lucide-react";

// Import APIs and helpers
import orderApi from "@/api/orderApi";
import { 
  getStatusIcon, 
  getStatusColor, 
  formatDate, 
  formatPrice,
  calculateProductDetails,
  getActionButtons,
  buttonVariantClasses
} from "@/utils/orderHelpers.jsx";

const OrderData = ({
  products = [],
  amount = 0,
  status = "PLACED",
  createdAt,
  _id,
  onCancel
}) => {
  const orderId = _id;
  const [trackingData, setTrackingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTracking, setShowTracking] = useState(false);

  const handleTrackOrder = async () => {
    if (showTracking) {
      setShowTracking(false);
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const data = await orderApi.trackOrder(orderId, token);
      setTrackingData(data);
      setShowTracking(true);
    } catch (error) {
      alert(error.message || "Failed to fetch tracking data");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = () => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      onCancel();
    }
  };

  const actionButtons = getActionButtons({
    status,
    loading,
    handleTrackOrder,
    handleCancelClick
  });

  const ProductItem = ({ product, idx }) => {
    const { itemTotal, saved, originalTotal } = calculateProductDetails(product);

    return (
      <div
        key={product.productId || idx}
        className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-600 transition-colors"
      >
        {/* Product Image */}
        <div className="relative">
          <img
            src={product.image || "/placeholder.png"}
            alt={product.name}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover shadow-sm"
          />
          {saved > 0 && (
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              Save {formatPrice(saved)}
            </span>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base line-clamp-2">
                {product.name}
              </h3>
              
              {product.color && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Color:</span>
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: product.color }}
                  />
                </div>
              )}
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Quantity: {product.quantity}
              </p>
            </div>

            <div className="text-right">
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {formatPrice(itemTotal)}
              </p>
              {product.originalPrice && product.originalPrice > product.price && (
                <p className="text-sm text-gray-500 dark:text-gray-400 line-through">
                  {formatPrice(originalTotal)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const OrderSummaryCard = ({ title, value, icon: Icon, bgColor = "blue", textColor = "blue" }) => (
    <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 bg-${bgColor}-100 dark:bg-${bgColor}-900/30 rounded-lg flex items-center justify-center`}>
          <Icon className={`w-5 h-5 text-${textColor}-600 dark:text-${textColor}-400`} />
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <div className="font-semibold text-gray-900 dark:text-white">{value}</div>
        </div>
      </div>
    </div>
  );

  const ActionButton = ({ button, index }) => (
    <button
      key={index}
      onClick={button.onClick}
      disabled={button.disabled}
      className={`px-6 py-3 font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${buttonVariantClasses[button.variant]}`}
    >
      {button.icon}
      {button.label}
    </button>
  );

  const TrackingHistory = () => (
    <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800 animate-fadeIn">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        {getStatusIcon("SHIPPED")}
        Tracking History
      </h3>
      
      <div className="space-y-4">
        {trackingData.map((step, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 p-3 ${
              idx === trackingData.length - 1 
                ? "bg-white dark:bg-gray-800 rounded-lg shadow-sm" 
                : "bg-white/50 dark:bg-gray-800/50 rounded-lg"
            }`}
          >
            <div className={`w-3 h-3 rounded-full mt-1.5 ${
              idx === trackingData.length - 1 ? "bg-green-500 animate-pulse" : "bg-blue-500"
            }`}></div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">{step.status}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {step.updated_at ? formatDate(step.updated_at) : "Date not available"}
              </p>
              {step.location && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  📍 {step.location}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const NoTrackingMessage = () => (
    <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
      {getStatusIcon("SHIPPED")}
      <p className="text-gray-600 dark:text-gray-400 mt-3">
        No tracking information available yet. Check back later.
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Products List */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Order Items</h3>
        {products.map((product, idx) => (
          <ProductItem key={product.productId || idx} product={product} idx={idx} />
        ))}
      </div>

      {/* Order Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <OrderSummaryCard
          title="Order Date"
          value={formatDate(createdAt)}
          icon={Calendar}
          bgColor="blue"
          textColor="blue"
        />
        
        <OrderSummaryCard
          title="Status"
          value={
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(status)}`}>
              {getStatusIcon(status)}
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </div>
          }
          icon={getStatusIcon}
          bgColor="green"
          textColor="green"
        />
        
        <OrderSummaryCard
          title="Total Amount"
          value={formatPrice(amount)}
          icon={IndianRupee}
          bgColor="purple"
          textColor="purple"
        />
      </div>

      {/* Dynamic Action Buttons */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        {actionButtons.map((button, index) => (
          <ActionButton key={index} button={button} index={index} />
        ))}
      </div>

      {/* Tracking Data */}
      {showTracking && trackingData.length > 0 && <TrackingHistory />}
      {showTracking && trackingData.length === 0 && <NoTrackingMessage />}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default OrderData;