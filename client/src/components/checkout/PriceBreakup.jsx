import React from "react";
import { useSelector } from "react-redux";
import { ShoppingBag, Tag, Truck, CreditCard } from "lucide-react";

const PriceBreakup = () => {
  const { summary } = useSelector((s) => s.checkout);

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-zinc-800">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Price Breakdown
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Review your order summary
          </p>
        </div>
      </div>

      {/* Price Items */}
      <div className="space-y-4">
        {/* Subtotal */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-zinc-700 rounded-md">
              <ShoppingBag className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                Subtotal
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Price of all items
              </p>
            </div>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            ₹{summary.subtotal?.toFixed(2) || "0.00"}
          </p>
        </div>

        {/* Discount */}
        {summary.discount > 0 && (
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-800/40 rounded-md">
                <Tag className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-green-700 dark:text-green-300">
                  Discount
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Savings on your order
                </p>
              </div>
            </div>
            <p className="text-lg font-semibold text-green-600 dark:text-green-400">
              -₹{summary.discount?.toFixed(2) || "0.00"}
            </p>
          </div>
        )}

        {/* Shipping */}
        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-800/40 rounded-md">
              <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                Shipping
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Delivery charges
              </p>
            </div>
          </div>
          <div className="text-right">
            {summary.shipping === 0 ? (
              <div>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  FREE
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 line-through">
                  ₹{summary.shipping?.toFixed(2) || "0.00"}
                </p>
              </div>
            ) : (
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                ₹{summary.shipping?.toFixed(2) || "0.00"}
              </p>
            )}
          </div>
        </div>

        {/* Tax (if applicable) */}
        {summary.tax > 0 && (
          <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <div>
              <p className="font-medium text-amber-700 dark:text-amber-300">
                Tax & Charges
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                GST and other fees
              </p>
            </div>
            <p className="text-lg font-semibold text-amber-600 dark:text-amber-400">
              ₹{summary.tax?.toFixed(2) || "0.00"}
            </p>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-zinc-700 my-4"></div>

        {/* Grand Total */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl border border-blue-100 dark:border-blue-800">
          <div>
            <p className="font-bold text-lg text-gray-900 dark:text-gray-100">
              Total Amount
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Amount to be paid
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              ₹{summary.total?.toFixed(2) || "0.00"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Inclusive of all charges
            </p>
          </div>
        </div>

        {/* Savings Summary */}
        {summary.discount > 0 && (
          <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-100 dark:border-green-800/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-green-100 dark:bg-green-800/40 rounded-md">
                  <Tag className="w-3 h-3 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  Total Savings
                </span>
              </div>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                ₹{summary.discount?.toFixed(2) || "0.00"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Payment Info */}
      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-zinc-800">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Payment method</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {summary.paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PriceBreakup;