import { ShoppingBag, CreditCard, Loader2 } from "lucide-react";

const ProductActions = ({
  stock,
  onAddToCart,
  onBuyNow,
  loading = false,
  paymentOptions,
  highlights = []
}) => {
  const isOutOfStock = stock === 0;

  return (
    <div className="space-y-6">
      {/* CTA Buttons */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onAddToCart}
            disabled={isOutOfStock || loading}
            className={`flex-1 py-3.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm font-semibold ${
              isOutOfStock
                ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                : loading
                ? "bg-yellow-400 text-white cursor-wait"
                : "bg-yellow-500 hover:bg-yellow-600 text-white"
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <ShoppingBag size={20} />
                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </>
            )}
          </button>
          
          <button
            onClick={onBuyNow}
            disabled={isOutOfStock || loading}
            className={`flex-1 py-3.5 px-6 rounded-lg transition-colors shadow-sm font-semibold ${
              isOutOfStock
                ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                : loading
                ? "bg-orange-400 text-white cursor-wait"
                : "bg-orange-500 hover:bg-orange-600 text-white"
            }`}
          >
            {loading ? "Processing..." : "Buy Now"}
          </button>
        </div>
        
        {paymentOptions && (
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <CreditCard size={14} />
            <span>{paymentOptions}</span>
          </div>
        )}
      </div>

      {/* Product Highlights */}
      {highlights.length > 0 && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">
            Product Highlights
          </h3>
          <ul className="space-y-2">
            {highlights.map((highlight, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-green-500 mt-1 flex-shrink-0">✓</span>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {highlight}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProductActions;