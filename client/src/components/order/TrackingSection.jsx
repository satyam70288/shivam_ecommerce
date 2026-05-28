// src/components/custom/OrderData/TrackingSection.jsx
import React from "react";
import { getStatusIcon, formatDate } from "@/utils/orderHelpers";

const TrackingStep = ({ step, isLast }) => {
  const statusText =
    step.status || step.activity || step.shipment_status || "Update";
  const dateVal =
    step.updated_at || step.date || step.activity_date || step["date-time"];
  const location = step.location || step.sr_location || step.place;

  return (
    <div
      className={`flex items-start gap-3 p-3 ${
        isLast ? "bg-white dark:bg-gray-800" : "bg-white/50 dark:bg-gray-800/50"
      } rounded-lg`}
    >
      <div
        className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${
          isLast ? "bg-green-500 animate-pulse" : "bg-blue-500"
        }`}
      />
      <div className="flex-1">
        <p className="font-medium text-gray-900 dark:text-white">{statusText}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {dateVal ? formatDate(dateVal) : "Date not available"}
        </p>
        {location && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
            📍 {location}
          </p>
        )}
      </div>
    </div>
  );
};

const TrackingHistory = ({ trackingData }) => (
  <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
    <div className="flex items-center gap-2 mb-4">
      {getStatusIcon("SHIPPED", "w-5 h-5")}
      <h3 className="font-semibold text-gray-900 dark:text-white">Tracking History</h3>
    </div>
    <div className="space-y-3">
      {list.map((step, idx) => (
        <TrackingStep
          key={idx}
          step={step}
          isLast={idx === list.length - 1}
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

const TrackingSection = ({ trackingData = [] }) => {
  const list = Array.isArray(trackingData) ? trackingData : [];
  return list.length > 0 ? (
    <TrackingHistory trackingData={trackingData} />
  ) : (
    <NoTrackingMessage />
  );
};

export default TrackingSection;