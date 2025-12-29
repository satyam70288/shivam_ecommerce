// src/components/custom/OrderData/ProductItem.jsx
import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { calculateProductDetails } from "@/utils/orderHelpers";

const ProductItem = ({ product }) => {
  const [expanded, setExpanded] = useState(false);
  const details = calculateProductDetails(product);
  const { itemTotal, saved, originalTotal, rawSaved, discountPercent } = details;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-3 sm:p-4">
        <div className="flex gap-3">
          {/* Product Image */}
          <div className="relative flex-shrink-0">
            <img
              src={product.image || "/placeholder.png"}
              alt={product.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover bg-gray-100 dark:bg-gray-700"
            />

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
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base line-clamp-1 sm:line-clamp-2 mb-1 sm:mb-2">
              {product.name}
            </h3>

            <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                Qty: {product.quantity}
              </span>

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

              {product.size && (
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Size: {product.size}
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-gray-900 dark:text-white text-base sm:text-lg">
                  ₹{itemTotal}
                </span>

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

              <button
                onClick={() => setExpanded(!expanded)}
                className="sm:hidden text-blue-600 dark:text-blue-400 text-xs font-medium flex items-center gap-1 self-start"
              >
                {expanded ? "Less details" : "More details"}
                {expanded ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="hidden sm:flex text-blue-600 dark:text-blue-400 text-sm font-medium items-center gap-1 self-start mt-1"
          >
            {expanded ? "Less" : "More"}
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

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

            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Item Total
                </p>
                <p className="font-bold text-gray-900 dark:text-white">₹{itemTotal}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductItem;