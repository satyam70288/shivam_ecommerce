const MobileStickyCTA = ({ product, onAddToCart, onBuyNow }) => {
  if (!product || product.stock === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3 flex gap-3">
          
          <button
            onClick={onAddToCart}
            className="flex-1 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white font-semibold"
          >
            Add to Cart
          </button>

          <button
            onClick={onBuyNow}
            className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold"
          >
            Buy Now
          </button>

        </div>
      </div>

      {/* iOS safe area */}
      <div className="h-safe-bottom bg-white dark:bg-gray-900" />
      <style jsx>{`
        .h-safe-bottom {
          height: env(safe-area-inset-bottom);
        }
      `}</style>
    </div>
  );
};

export default MobileStickyCTA;
