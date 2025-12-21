import React from "react";
import { useSelector } from "react-redux";
import { Check, Tag, Package, Percent, ShoppingBag } from "lucide-react";

const Items = () => {
  const { items = [] } = useSelector((s) => s.checkout);

  if (!items.length) {
    return (
      <div className="text-center py-10 px-4 border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-2xl">
        <ShoppingBag className="w-14 h-14 text-gray-400 dark:text-zinc-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
          Your cart is empty
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto text-sm md:text-base">
          Add items to your cart to proceed with checkout
        </p>
      </div>
    );
  }

  const calculateTotalSavings = () => {
    return items.reduce((total, item) => {
      return total + (item.discountAmount * item.quantity);
    }, 0);
  };

  const totalSavings = calculateTotalSavings();

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-4 md:p-6 shadow-lg">
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-zinc-800 gap-3 sm:gap-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100">
              Order Items ({items.length})
            </h2>
            {totalSavings > 0 && (
              <p className="text-xs md:text-sm text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
                <Tag size={12} />
                <span className="font-medium">
                  You saved ₹{totalSavings.toFixed(2)}
                </span>
              </p>
            )}
          </div>
        </div>
        <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 self-end sm:self-center">
          {items.length} item{items.length > 1 ? "s" : ""}
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-4 md:space-y-5">
        {items.map((item, index) => {
          const itemTotal = item.lineTotal;
          const totalDiscount = item.discountAmount * item.quantity;

          return (
            <div
              key={item.productId}
              className={`relative p-3 md:p-4 rounded-xl transition-all duration-300 ${
                index !== items.length - 1
                  ? "border-b border-gray-100 dark:border-zinc-800 pb-4 md:pb-5"
                  : ""
              }`}
            >
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-start">
                {/* Product Image - Mobile Centered */}
                <div className="relative self-center sm:self-start">
                  <img
                    src={item.image || "/placeholder.png"}
                    alt={item.name}
                    className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-xl border-2 border-gray-200 dark:border-zinc-700 shadow-sm"
                  />
                  {item.discountPercent > 0 && (
                    <div className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] md:text-xs font-bold px-1.5 md:px-2 py-0.5 md:py-1 rounded-full shadow-lg">
                      {item.discountPercent}% OFF
                    </div>
                  )}
                </div>

                {/* Product Details - Full Width on Mobile */}
                <div className="flex-1 space-y-2 md:space-y-3 w-full">
                  {/* Name & Quantity - Mobile Stacked */}
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base md:text-lg line-clamp-2">
                      {item.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm">
                        <Check size={10} className="md:w-3 md:h-3" />
                        Qty: {item.quantity}
                      </span>
                      {item.color && (
                        <span className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm">
                          <div
                            className="w-2 h-2 md:w-3 md:h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          ></div>
                          {item.color}
                        </span>
                      )}
                      {item.size && (
                        <span className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm">
                          Size: {item.size}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pricing - Mobile Optimized */}
                  <div className="space-y-1 md:space-y-2">
                    <div className="flex flex-wrap items-baseline gap-2 md:gap-3">
                      {item.discountAmount > 0 ? (
                        <>
                          <span className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
                            ₹{item.finalPrice.toFixed(2)}
                          </span>
                          <span className="text-base md:text-lg line-through text-gray-400">
                            ₹{item.price.toFixed(2)}
                          </span>
                          <span className="text-xs md:text-sm font-semibold text-green-600 dark:text-green-400">
                            <Percent size={10} className="inline mr-1" />
                            Save {item.discountPercent}%
                          </span>
                        </>
                      ) : (
                        <span className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
                          ₹{item.price.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {totalDiscount > 0 && (
                      <div className="flex items-center gap-2 text-xs md:text-sm">
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 md:px-3 md:py-1 rounded-lg">
                          <Tag size={10} className="md:w-3 md:h-3" />
                          <span>Saved ₹{totalDiscount.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Item Total - Right Aligned on Desktop */}
                <div className="text-right w-full sm:w-auto mt-2 sm:mt-0">
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Item Total
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
                    ₹{itemTotal.toFixed(2)}
                  </p>
                  <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    ₹{item.finalPrice.toFixed(2)} × {item.quantity}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer - Responsive Grid */}
      {items.length > 0 && (
        <div className="mt-6 pt-4 md:pt-5 border-t border-gray-100 dark:border-zinc-800">
          <div className="grid grid-cols-2 md:flex md:justify-between items-center gap-4 md:gap-0">
            {/* Total Items */}
            <div className="text-gray-600 dark:text-gray-400">
              <p className="text-xs md:text-sm">Total Items</p>
              <p className="text-base md:text-lg font-semibold">{items.length}</p>
            </div>
            
            {/* Total Savings */}
            <div className="text-gray-600 dark:text-gray-400 text-right md:text-center">
              <p className="text-xs md:text-sm">Total Savings</p>
              <p className="text-base md:text-lg font-semibold text-green-600 dark:text-green-400">
                ₹{totalSavings.toFixed(2)}
              </p>
            </div>
            
            {/* Order Total - Full width on mobile, right on desktop */}
            <div className="col-span-2 md:col-span-1 mt-2 md:mt-0 text-center md:text-right">
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                Order Total
              </p>
              <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
                ₹{items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Items;