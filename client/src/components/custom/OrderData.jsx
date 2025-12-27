// src/components/custom/OrderData.jsx
import React, { useState, useMemo } from "react";
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

import { ChevronDown, ChevronUp } from 'lucide-react';

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
const [showActions, setShowActions] = useState(false);
  // Memoized calculations
  const formattedStatus = useMemo(() => 
    status.charAt(0) + status.slice(1).toLowerCase(), 
    [status]
  );

  const statusIcon = useMemo(() => 
    getStatusIcon(status), 
    [status]
  );

  const statusDisplay = useMemo(() => (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(status)}`}>
      {statusIcon}
      {formattedStatus}
    </div>
  ), [status, statusIcon, formattedStatus]);

  // Pre-calculate product details
  const productDetails = useMemo(() => 
    products.map(product => calculateProductDetails(product)),
    [products]
  );

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

  // Reusable components
  const ProductItem = ({ product, details, idx }) => {
  const { itemTotal, saved, originalTotal, rawSaved, discountPercent } = details;
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Product Card - Compact Mobile View */}
      <div className="p-3 sm:p-4">
        <div className="flex gap-3">
          {/* Product Image - Smaller on Mobile */}
          <div className="relative flex-shrink-0">
            <img
              src={product.image || "/placeholder.png"}
              alt={product.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover bg-gray-100 dark:bg-gray-700"
            />
            
            {/* Save Badge - Mobile Optimized */}
            {rawSaved > 0 && (
              <div className="absolute -top-1 -left-1 flex flex-col items-center">
                <div className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-t">
                  {discountPercent}% OFF
                </div>
                <div className="bg-green-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-b">
                  Save ₹{saved}
                </div>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            {/* Product Name - Responsive */}
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base line-clamp-1 sm:line-clamp-2 mb-1 sm:mb-2">
              {product.name}
            </h3>

            {/* Product Info - Compact on Mobile */}
            <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
              {/* Quantity Badge */}
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                Qty: {product.quantity}
              </span>
              
              {/* Color Chip */}
              {product.color && (
                <div className="flex items-center gap-1">
                  <div 
                    className="w-3 h-3 rounded-full border border-gray-300"
                    style={{ backgroundColor: product.color }}
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {product.color}
                  </span>
                </div>
              )}
              
              {/* Size */}
              {product.size && (
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Size: {product.size}
                </span>
              )}
            </div>

            {/* Price Section - Mobile Stacked, Desktop Inline */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              {/* Current Price */}
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-gray-900 dark:text-white text-base sm:text-lg">
                  ₹{itemTotal}
                </span>
                
                {/* Original Price - Desktop */}
                {rawSaved > 0 && (
                  <div className="hidden sm:flex flex-col">
                    <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                      ₹{originalTotal}
                    </span>
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                      You saved ₹{saved}
                    </span>
                  </div>
                )}
              </div>

              {/* Original Price - Mobile */}
              {rawSaved > 0 && (
                <div className="sm:hidden">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                      ₹{originalTotal}
                    </span>
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">
                      Save ₹{saved}
                    </span>
                  </div>
                </div>
              )}

              {/* Expand Button - Mobile Only */}
              <button
                onClick={() => setExpanded(!expanded)}
                className="sm:hidden text-blue-600 dark:text-blue-400 text-xs font-medium flex items-center gap-1 self-start"
              >
                {expanded ? 'Less details' : 'More details'}
                {expanded ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>

          {/* Expand Button - Desktop */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="hidden sm:flex text-blue-600 dark:text-blue-400 text-sm font-medium items-center gap-1 self-start mt-1"
          >
            {expanded ? 'Less' : 'More'}
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Details - Mobile Collapsible */}
      {expanded && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 border-t border-gray-100 dark:border-gray-700 animate-slideDown">
          <div className="pt-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">Unit Price</p>
                <p className="font-medium text-sm">₹{product.price?.toFixed(1)}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">Quantity</p>
                <p className="font-medium text-sm">{product.quantity}</p>
              </div>
              
              {product.originalPrice && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Original</p>
                  <p className="font-medium text-sm line-through">
                    ₹{product.originalPrice?.toFixed(1)}
                  </p>
                </div>
              )}
              
              <div className="space-y-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">You Saved</p>
                <p className="font-medium text-sm text-green-600 dark:text-green-400">
                  ₹{saved}
                </p>
              </div>
            </div>
            
            {/* Item Total */}
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Item Total
                </p>
                <p className="font-bold text-gray-900 dark:text-white">
                  ₹{itemTotal}
                </p>
              </div>
            </div>
            
            {/* Quick Actions - Mobile Only
            <div className="sm:hidden mt-4 flex gap-2">
              <button className="flex-1 py-2 text-sm text-blue-600 dark:text-blue-400 font-medium border border-blue-200 dark:border-blue-800 rounded-lg">
                Buy Again
              </button>
              <button className="flex-1 py-2 text-sm text-gray-700 dark:text-gray-300 font-medium border border-gray-200 dark:border-gray-700 rounded-lg">
                View Details
              </button>
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
};

  // Reusable Order Summary Card
  const OrderSummaryCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color = "blue" 
  }) => {
    const colorClasses = {
      blue: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-600 dark:text-blue-400',
        iconBg: 'bg-blue-50 dark:bg-blue-900/20'
      },
      green: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-600 dark:text-green-400',
        iconBg: 'bg-green-50 dark:bg-green-900/20'
      },
      purple: {
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        text: 'text-purple-600 dark:text-purple-400',
        iconBg: 'bg-purple-50 dark:bg-purple-900/20'
      }
    };

    const classes = colorClasses[color];

    return (
      <div className={`p-4 rounded-xl border ${classes.bg} border-gray-200 dark:border-gray-700`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${classes.iconBg} rounded-lg flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${classes.text}`} />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
            <div className="font-semibold text-gray-900 dark:text-white">{value}</div>
          </div>
        </div>
      </div>
    );
  };

  // Reusable Action Button
  const ActionButton = ({ button }) => (
    <button
      onClick={button.onClick}
      disabled={button.disabled}
      className={`px-5 py-3 font-semibold rounded-xl transition-all duration-200 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 flex-1 min-w-[140px] ${buttonVariantClasses[button.variant]}`}
    >
      {button.icon}
      {button.label}
    </button>
  );

  // Reusable Tracking Components
  const TrackingStep = ({ step, isLast }) => (
    <div className={`flex items-start gap-3 p-3 ${isLast ? 'bg-white dark:bg-gray-800' : 'bg-white/50 dark:bg-gray-800/50'} rounded-lg`}>
      <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${isLast ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`} />
      <div className="flex-1">
        <p className="font-medium text-gray-900 dark:text-white">{step.status}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {step.updated_at ? formatDate(step.updated_at) : "Date not available"}
        </p>
        {step.location && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
            📍 {step.location}
          </p>
        )}
      </div>
    </div>
  );

  const TrackingHistory = () => (
    <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
      <div className="flex items-center gap-2 mb-4">
        {getStatusIcon("SHIPPED", "w-5 h-5")}
        <h3 className="font-semibold text-gray-900 dark:text-white">Tracking History</h3>
      </div>
      
      <div className="space-y-3">
        {trackingData.map((step, idx) => (
          <TrackingStep 
            key={idx} 
            step={step} 
            isLast={idx === trackingData.length - 1} 
          />
        ))}
      </div>
    </div>
  );

  const NoTrackingMessage = () => (
    <div className="mt-6 p-5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
        {getStatusIcon("SHIPPED", "w-6 h-6 text-gray-400")}
      </div>
      <p className="text-gray-600 dark:text-gray-400">
        No tracking information available yet. Check back later.
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Products List */}
      <div className="space-y-3 sm:space-y-4">
  {/* Header with item count */}
  <div className="flex items-center justify-between px-2 sm:px-0">
    <h3 className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg">
      Order Items
    </h3>
    <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
      {products.length} {products.length === 1 ? 'item' : 'items'}
    </span>
  </div>
  
  {/* Products Grid/List */}
  <div className="space-y-2 sm:space-y-3">
    {products.map((product, idx) => (
      <ProductItem 
        key={product.productId || idx} 
        product={product} 
        details={productDetails[idx]} 
        idx={idx} 
      />
    ))}
  </div>
</div>

      {/* Order Summary Cards */}
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-4">Order Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <OrderSummaryCard
            title="Order Date"
            value={formatDate(createdAt)}
            icon={Calendar}
            color="blue"
          />
          
          <OrderSummaryCard
            title="Status"
            value={statusDisplay}
            icon={Calendar}
            color="green"
          />
          
          <OrderSummaryCard
            title="Total Amount"
            value={formatPrice(amount)}
            icon={IndianRupee}
            color="purple"
          />
        </div>
      </div>

      {/* Dynamic Action Buttons */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
    {/* Mobile: Collapsible Header */}
    <div 
      className="flex items-center justify-between cursor-pointer md:cursor-default"
      onClick={() => window.innerWidth < 768 && setShowActions(!showActions)}
    >
      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
        Order Actions
      </h3>
      
      {/* Mobile Toggle Button */}
      <button className="md:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
        {showActions ? (
          <ChevronUp className="w-5 h-5" />
        ) : (
          <ChevronDown className="w-5 h-5" />
        )}
      </button>
    </div>
    
    {/* Actions - Hidden on Mobile by default */}
    <div className={`
      ${showActions ? 'block' : 'hidden md:block'}
      mt-4 md:mt-0
    `}>
      <div className="flex flex-wrap gap-3">
        {actionButtons.map((button, idx) => (
          <ActionButton key={idx} button={button} />
        ))}
      </div>
    </div>
  </div>
      {/* Tracking Data */}
      {showTracking && (
        trackingData.length > 0 ? <TrackingHistory /> : <NoTrackingMessage />
      )}
    </div>
  );
};

export default OrderData;