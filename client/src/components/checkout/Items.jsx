import React from "react";
import { useSelector } from "react-redux";


const Items = () => {
  const { items = [] } = useSelector((s) => s.checkout);

  if (!items.length) {
    return (
      <p className="text-sm text-gray-500">
        No items found
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const itemTotal = item.lineTotal; // 🔒 backend snapshot
        const totalDiscount =
          item.discountAmount * item.quantity; // 🔒 snapshot-based

        return (
          <div
            key={item.productId}
            className="flex gap-4 border-b pb-3 items-start"
          >
            {/* LEFT: IMAGE */}
            <img
              src={item.image || "/placeholder.png"}
              alt={item.name}
              className="w-20 h-20 object-cover rounded-md border"
            />

            {/* MIDDLE: DETAILS */}
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {item.name}
              </p>

              <p className="text-sm text-gray-500">
                Qty: {item.quantity}
              </p>

              {item.discountAmount > 0 ? (
                <div className="text-sm mt-1">
                  <span className="line-through text-gray-400 mr-2">
                    ₹{item.price}
                  </span>

                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    ₹{item.finalPrice}
                  </span>

                  {item.discountPercent > 0 && (
                    <span className="ml-2 text-xs text-green-600">
                      ({item.discountPercent}% OFF)
                    </span>
                  )}

                  <p className="text-green-600 text-xs mt-0.5">
                    You saved ₹{totalDiscount}
                  </p>
                </div>
              ) : (
                <p className="font-semibold mt-1 text-gray-900 dark:text-gray-100">
                  ₹{item.price}
                </p>
              )}
            </div>

            {/* RIGHT: ITEM TOTAL */}
            <p className="font-semibold whitespace-nowrap text-gray-900 dark:text-gray-100">
              ₹{itemTotal}
            </p>
          </div>
        );
      })}
    </div>
  );
};




export default Items;
