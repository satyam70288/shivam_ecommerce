const PriceSection = ({ price, displayPrice, discount, isOfferActive }) => {
  const savings = (price - displayPrice).toFixed(1);
 
  return (
    <>
      {/* PRICE ROW */}
      <div className="mt-3 flex items-end gap-3 flex-wrap">
        <span className="
          text-3xl font-bold
          text-gray-900
          dark:text-white
        ">
          ₹{displayPrice}
        </span>

        <span className="
          line-through text-sm
          text-gray-500
          dark:text-gray-400
        ">
          ₹{price}
        </span>

        {isOfferActive && (
          <span className="
            text-xs font-semibold
            text-green-700
            dark:text-green-400
            bg-green-100
            dark:bg-green-500/10
            px-2 py-1
            rounded-full
          ">
            {discount}% OFF
          </span>
        )}
      </div>

      {/* SAVINGS */}
      {isOfferActive && savings > 0 && (
        <p className="
          mt-1 text-sm font-medium
          text-green-700
          dark:text-green-400
        ">
          You save ₹{savings}
        </p>
      )}

      {/* TAX INFO */}
      <p className="
        mt-1 text-xs
        text-gray-600
        dark:text-gray-400
      ">
        Inclusive of all taxes
      </p>

      {/* DELIVERY INFO */}
      <p className="
        mt-2 text-sm
        text-gray-700
        dark:text-gray-300
      ">
        🚚 Free delivery by <span className="font-semibold">Tomorrow</span>
      </p>

      {/* TRUST BADGES */}
      <p className="
        mt-2 text-xs
        text-gray-600
        dark:text-gray-400
      ">
        ✔ 100% Original • ✔ Easy Returns • ✔ Secure Payments
      </p>
    </>
  );
};

export default PriceSection;
