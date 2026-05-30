import QuantitySelector from "@/components/Product/QuantitySelector";

/** Customer-facing: quantity only (no color/size — not a clothing store) */
const ProductVariants = ({ stock, quantity, onQuantityChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium text-gray-900 dark:text-white mb-3">
          Quantity
        </h3>
        <div className="flex items-center gap-6">
          <QuantitySelector
            value={quantity}
            onChange={onQuantityChange}
            max={stock}
          />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {stock > 0 ? (
              <>
                Only{" "}
                <span className="font-medium text-gray-900 dark:text-white">
                  {stock}
                </span>{" "}
                items left
              </>
            ) : (
              <span className="text-red-500 dark:text-red-400 font-medium">
                Out of Stock
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductVariants;
