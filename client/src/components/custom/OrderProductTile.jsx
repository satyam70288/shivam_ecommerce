import React from "react";

const OrderProductTile = ({ id, name, price, quantity, color, size }) => {
  const imageUrl = id?.variants?.[0]?.images?.[0]?.url;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-zinc-800">
      {/* Product Info */}
      <div className="flex flex-row items-center gap-3 w-full sm:w-auto">
        <img
          src={imageUrl || "/placeholder.png"}
          alt={id?.name || name}
          className="w-20 sm:w-24 h-20 sm:h-24 object-cover rounded-lg border border-gray-200 dark:border-zinc-700"
        />
        <div className="flex flex-col gap-1">
          <h1 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white">
            {id?.name || name}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-600 dark:text-customGray">
            {/* Color */}
            <span className="flex items-center gap-1 font-semibold">
              Color:
              <span
                className="inline-block w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: color }}
              ></span>
            </span>
            {/* Size */}
            <span className="font-semibold">
              Size: <span className="font-medium">{size || "—"}</span>
            </span>
            {/* Quantity */}
            <span className="font-semibold">
              Qty:{" "}
              <span className="font-bold text-customYellow">{quantity}</span>
            </span>
            {/* Price */}
            <span className="font-semibold">
              Price:{" "}
              <span className="font-bold text-customYellow">
                ₹{price || id?.price}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderProductTile;
