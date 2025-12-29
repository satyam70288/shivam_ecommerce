// src/components/custom/OrderData/OrderSummary.jsx
import React from "react";
import { IndianRupee, Calendar, ChevronDown } from "lucide-react";
import { formatDate, formatPrice } from "@/utils/orderHelpers";

const OrderSummary = ({
  createdAt,
  statusIcon,
  statusDisplay,
  subtotal,
  shippingCharge,
  amount,
  showBreakdown,
  setShowBreakdown,
}) => {
  return (
    <div>
      <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-4 sm:mb-5">
        Order Summary
      </h3>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        {/* Mobile: Stacked Cards View */}
        <div className="sm:hidden space-y-4 p-4">
          {/* Date Card */}
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-gray-600 dark:text-gray-400">Order Date</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">
              {formatDate(createdAt)}
            </span>
          </div>

          {/* Status Card */}
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                {statusIcon}
              </div>
              <span className="text-gray-600 dark:text-gray-400">Status</span>
            </div>
            <div>{statusDisplay}</div>
          </div>

          {/* Shipping Card */}
          <div
            className={`flex items-center justify-between p-3 rounded-lg ${
              shippingCharge === 0
                ? "bg-green-50 dark:bg-green-900/20"
                : "bg-purple-50 dark:bg-purple-900/20"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  shippingCharge === 0
                    ? "bg-green-100 dark:bg-green-900/30"
                    : "bg-purple-100 dark:bg-purple-900/30"
                }`}
              >
                <IndianRupee
                  className={`w-5 h-5 ${
                    shippingCharge === 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-purple-600 dark:text-purple-400"
                  }`}
                />
              </div>
              <span className="text-gray-600 dark:text-gray-400">Shipping</span>
            </div>
            <span
              className={`font-semibold ${
                shippingCharge === 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-900 dark:text-white"
              }`}
            >
              {shippingCharge === 0 ? "FREE" : formatPrice(shippingCharge)}
            </span>
          </div>

          {/* Total Amount Card (Highlighted) */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <IndianRupee className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Total Amount
                  </p>
                  <p className="font-bold text-gray-900 dark:text-white text-2xl">
                    {formatPrice(amount)}
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile Breakdown */}
            <div className="pt-3 border-t border-blue-100 dark:border-blue-800">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer text-sm text-blue-600 dark:text-blue-400">
                  <span>View breakdown</span>
                  <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal:</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Shipping:</span>
                    <span
                      className={
                        shippingCharge === 0
                          ? "text-green-600 dark:text-green-400"
                          : ""
                      }
                    >
                      {shippingCharge === 0 ? "FREE" : formatPrice(shippingCharge)}
                    </span>
                  </div>
                  <div className="h-px bg-gray-200 dark:bg-gray-700 my-2"></div>
                  <div className="flex justify-between font-semibold text-gray-900 dark:text-white">
                    <span>Total:</span>
                    <span>{formatPrice(amount)}</span>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>

        {/* Desktop: Grid Table View */}
        <div className="hidden sm:block">
          {/* Table Header */}
          <div className="grid grid-cols-1 md:grid-cols-12 p-4 md:p-5 border-b border-gray-100 dark:border-gray-700">
            <div className="md:col-span-3 font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Order Date
            </div>
            <div className="md:col-span-3 font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              {statusIcon}
              Status
            </div>
            <div className="md:col-span-3 font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <IndianRupee className="w-4 h-4" />
              Shipping
            </div>
            <div className="md:col-span-3 font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <IndianRupee className="w-4 h-4" />
              Total Amount
            </div>
          </div>

          {/* Table Content */}
          <div className="grid grid-cols-1 md:grid-cols-12 p-4 md:p-5">
            <div className="md:col-span-3 font-semibold text-gray-900 dark:text-white flex items-center gap-2 py-2">
              <Calendar className="w-5 h-5 text-blue-500 md:hidden" />
              {formatDate(createdAt)}
            </div>
            <div className="md:col-span-3 py-2">{statusDisplay}</div>
            <div
              className={`md:col-span-3 py-2 flex items-center gap-2 ${
                shippingCharge === 0 ? "text-green-600 dark:text-green-400" : ""
              }`}
            >
              <IndianRupee className="w-5 h-5 text-purple-500 md:hidden" />
              {shippingCharge === 0 ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                  FREE
                </span>
              ) : (
                <span className="font-semibold">
                  {formatPrice(shippingCharge)}
                </span>
              )}
            </div>
            <div className="md:col-span-3 py-2">
              <div className="flex items-center gap-3">
                <div className="md:hidden w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <IndianRupee className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="font-bold text-xl text-gray-900 dark:text-white">
                    {formatPrice(amount)}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 md:hidden">
                    Total with delivery
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown Section */}
          <div className="p-4 md:p-5 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Breakdown:</span>
                <span className="ml-2 hidden md:inline">
                  Subtotal: {formatPrice(subtotal)} + Shipping:{" "}
                  {shippingCharge === 0 ? "FREE" : formatPrice(shippingCharge)} ={" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Total: {formatPrice(amount)}
                  </span>
                </span>
              </div>

              {/* Desktop Breakdown Details */}
              <div className="hidden md:flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Subtotal: {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      shippingCharge === 0 ? "bg-green-500" : "bg-purple-500"
                    }`}
                  ></div>
                  <span
                    className={
                      shippingCharge === 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-600 dark:text-gray-400"
                    }
                  >
                    Shipping: {shippingCharge === 0 ? "FREE" : formatPrice(shippingCharge)}
                  </span>
                </div>
              </div>

              {/* Mobile Breakdown Button */}
              <button
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="md:hidden flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-medium"
              >
                {showBreakdown ? "Hide" : "Show"} detailed breakdown
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    showBreakdown ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>

            {/* Mobile Expanded Breakdown */}
            {showBreakdown && (
              <div className="md:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                    <span
                      className={`font-semibold ${
                        shippingCharge === 0
                          ? "text-green-600 dark:text-green-400"
                          : ""
                      }`}
                    >
                      {shippingCharge === 0 ? "FREE" : formatPrice(shippingCharge)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 rounded-lg">
                    <span className="font-bold text-gray-900 dark:text-white">
                      Total Amount
                    </span>
                    <span className="font-bold text-xl text-gray-900 dark:text-white">
                      {formatPrice(amount)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;