import React from "react";
import { useSelector } from "react-redux";
import { Package } from "lucide-react";
import { normalizeLineItem, hasActiveDiscount } from "@/utils/pricing";

const Items = () => {
  const { items = [] } = useSelector((s) => s.checkout);

  if (!items.length) {
    return (
      <div className="text-center py-6 px-4">
        <div className="text-gray-400 dark:text-gray-600 text-sm">
          No items in cart
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Package className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          Items ({items.length})
        </span>
      </div>

      {items.map((raw) => {
        const item = normalizeLineItem(raw);
        const showDiscount = hasActiveDiscount(item);
        return (
          <div
            key={raw.cartItemId || item.productId}
            className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <img
                src={item.image}
                alt={item.name}
                className="w-14 h-14 object-cover rounded-lg border border-gray-100 dark:border-gray-700"
              />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[140px]">
                  {item.name}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Qty: {item.quantity}
                  </span>
                  {showDiscount && item.discountPercent > 0 && (
                    <span className="text-xs font-medium text-green-600 dark:text-green-400">
                      {item.discountPercent}% OFF
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                ₹{item.lineTotal.toFixed(2)}
              </p>
              {showDiscount && (
                <p className="text-xs text-gray-400 dark:text-gray-500 line-through">
                  ₹{(item.originalPrice * item.quantity).toFixed(2)}
                </p>
              )}
            </div>
          </div>
        );
      })}

    </div>
  );
};

export default Items;