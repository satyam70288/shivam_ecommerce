import React from "react";

const OrderProductTile = ({
  name,
  price,
  quantity,
  color,
  size,
  image,
}) => {
  return (
    <div className="group flex gap-4 p-4 rounded-2xl border bg-white dark:bg-zinc-900 hover:shadow-md transition-shadow">
      {/* IMAGE */}
      <div className="relative shrink-0">
        <img
          src={image || "/placeholder.png"}
          alt={name}
          className="w-20 h-20 rounded-xl object-cover border"
        />

        {/* QTY BADGE */}
        <span className="absolute -top-2 -right-2 bg-black text-white text-xs px-2 py-0.5 rounded-full">
          ×{quantity}
        </span>
      </div>

      {/* CONTENT */}
      <div className="flex flex-col justify-between flex-1">
        <div>
          <h3 className="font-semibold leading-tight line-clamp-2">
            {name}
          </h3>

          {(color || size) && (
            <div className="mt-1 flex gap-2 text-xs text-muted-foreground">
              {color && (
                <span className="px-2 py-0.5 rounded-full border">
                  {color}
                </span>
              )}
              {size && (
                <span className="px-2 py-0.5 rounded-full border">
                  {size}
                </span>
              )}
            </div>
          )}
        </div>

        {/* PRICE */}
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-muted-foreground">
            Price
          </p>
          <p className="font-semibold text-base">
            ₹{price}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderProductTile;
