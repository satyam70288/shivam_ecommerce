// src/components/custom/OrderData/OrderData.jsx
import React, { useState, useMemo } from "react";
import ProductItem from "../../components/order/ProductItem";
import OrderSummary from "../../components/order/OrderSummary";
import OrderActions from "../../components/order/OrderActions";
import TrackingSection from "../../components/order/TrackingSection";
import { getStatusIcon, getStatusColor, formatDate } from "@/utils/orderHelpers";

const OrderData = ({
  products = [],
  amount = 0,
  status = "PLACED",
  subtotal = 0,
  shippingCharge = 0,
  createdAt,
  _id,
  onCancel,
}) => {
  const [trackingData, setTrackingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Memoized calculations
  const formattedStatus = useMemo(
    () => status.charAt(0) + status.slice(1).toLowerCase(),
    [status]
  );

  const statusIcon = useMemo(() => getStatusIcon(status), [status]);

  const statusDisplay = useMemo(
    () => (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(
          status
        )}`}
      >
        {statusIcon}
        {formattedStatus}
      </div>
    ),
    [status, statusIcon, formattedStatus]
  );

  // Track order handler
  const handleTrackOrder = async () => {
    if (showTracking) {
      setShowTracking(false);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const data = await orderApi.trackOrder(_id, token);
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

  return (
    <div className="space-y-6">
      {/* Products List Section */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between px-2 sm:px-0">
          <h3 className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg">
            Order Items
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
            {products.length} {products.length === 1 ? "item" : "items"}
          </span>
        </div>

        <div className="space-y-2 sm:space-y-3">
          {products.map((product, idx) => (
            <ProductItem key={product.productId || idx} product={product} />
          ))}
        </div>
      </div>

      {/* Order Summary Section */}
      <OrderSummary
        createdAt={createdAt}
        statusIcon={statusIcon}
        statusDisplay={statusDisplay}
        subtotal={subtotal}
        shippingCharge={shippingCharge}
        amount={amount}
        showBreakdown={showBreakdown}
        setShowBreakdown={setShowBreakdown}
      />

      {/* Order Actions Section */}
      <OrderActions
        status={status}
        loading={loading}
        showActions={showActions}
        setShowActions={setShowActions}
        handleTrackOrder={handleTrackOrder}
        handleCancelClick={handleCancelClick}
      />

      {/* Tracking Section */}
      {showTracking && (
        <TrackingSection trackingData={trackingData} />
      )}
    </div>
  );
};

export default OrderData;