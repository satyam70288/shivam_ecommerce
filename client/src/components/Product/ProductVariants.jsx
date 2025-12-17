import ColorSelector from "@/components/Product/ColorSelector";
import SizeSelector from "@/components/Product/SizeSelector";
import QuantitySelector from "@/components/Product/QuantitySelector";

const ProductVariants = ({
  colors = [],
  selectedColor,
  onColorChange,
  sizes = [],
  selectedSize,
  onSizeChange,
  sizeGuide,
  stock,
  quantity,
  onQuantityChange
}) => {
  return (
    <div className="space-y-6">
      {/* Color Selection */}
      {colors.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-gray-900 dark:text-white">
              Color: <span className="font-normal">{selectedColor}</span>
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Select Color
            </span>
          </div>
          <ColorSelector
            colors={colors}
            value={selectedColor}
            onChange={onColorChange}
          />
        </div>
      )}

      {/* Size Selection */}
      {sizes.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-gray-900 dark:text-white">
              Size: <span className="font-normal">{selectedSize}</span>
            </h3>
            {sizeGuide && (
              <button 
                onClick={() => window.open(sizeGuide, '_blank')}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Size Guide
              </button>
            )}
          </div>
          <SizeSelector
            sizes={sizes}
            value={selectedSize}
            onChange={onSizeChange}
          />
        </div>
      )}

      {/* Quantity Selection */}
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
                Only <span className="font-medium text-gray-900 dark:text-white">
                  {stock}
                </span> items left
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