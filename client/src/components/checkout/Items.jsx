import React from "react";
import { useSelector } from "react-redux";

const Items = () => {
  const { items } = useSelector((s) => s.checkout);

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const itemTotal = item.finalPrice * item.quantity;
        const discountAmount = item.price - item.finalPrice;

        return (
          <div
            key={item.productId}
            className="flex justify-between items-start gap-4 border-b pb-3"
          >
            {/* LEFT: IMAGE */}
            <img
              src={item.image}
              alt={item.name}
              className="w-20 h-20 object-cover rounded-md border"
            />

            {/* MIDDLE: DETAILS */}
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-500">
                Qty: {item.quantity}
              </p>

              {discountAmount > 0 ? (
                <div className="text-sm mt-1">
                  <span className="line-through text-gray-400 mr-2">
                    ₹{item.price}
                  </span>
                  <span className="font-semibold">
                    ₹{item.finalPrice}
                  </span>
                  <p className="text-green-600 text-xs">
                    You saved ₹{discountAmount}
                  </p>
                </div>
              ) : (
                <p className="font-semibold mt-1">
                  ₹{item.price}
                </p>
              )}
            </div>

            {/* RIGHT: ITEM TOTAL */}
            <p className="font-semibold whitespace-nowrap">
              ₹{itemTotal}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default Items;
