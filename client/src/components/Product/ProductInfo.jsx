import PriceSection from "@/components/Product/PriceSection";
import RatingBadge from "@/components/Product/RatingBadge";

const ProductInfo = ({
  name,
  shortDesc,
  rating = 0,
  reviewCount = 0,
  soldCount = 0,
  brand,
  price,
  displayPrice,
  discount,
  isOfferActive
}) => {
  const showTrust = rating > 0 || reviewCount > 0 || soldCount > 0;

  return (
    <div className="space-y-5">
      {/* Product Title */}
      <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-snug">
        {name}
      </h1>

      {/* Short Value Proposition */}
      {shortDesc && (
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {shortDesc}
        </p>
      )}

      {/* Trust Signals */}
      {showTrust && (
        <div className="flex items-center gap-4 flex-wrap">
          {(rating > 0 || reviewCount > 0) && (
            <RatingBadge rating={rating} reviewCount={reviewCount} />
          )}

          {soldCount > 0 && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {soldCount}+ people bought this recently
            </span>
          )}
        </div>
      )}

      {/* Micro Trust Badges */}
      <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
        <span>✔ Quality checked</span>
        <span>✔ Secure checkout</span>
        <span>✔ Trusted seller</span>
      </div>

      {/* Brand */}
      {brand && (
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">
            Brand
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
            {brand}
          </span>
        </div>
      )}

      {/* Price Card */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/60 backdrop-blur p-4 space-y-3">
        <PriceSection
          price={price}
          displayPrice={displayPrice}
          discount={discount}
          isOfferActive={isOfferActive}
        />

        {/* Savings Highlight */}
        {isOfferActive && discount?.value && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-1 text-sm font-semibold text-green-700 dark:text-green-400">
              {discount.type === "percentage"
                ? `${discount.value}% OFF`
                : `₹${discount.value} OFF`}
            </span>

            <span className="text-xs text-gray-500 dark:text-gray-400">
              {discount.description || "Applied automatically at checkout"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductInfo;
