import { Minus, Plus, X } from "lucide-react";
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  increaseQuantity, 
  decreaseQuantity, 
  removeFromCart 
} from "@/redux/slices/cartSlice";

const CartProduct = ({
  name,
  price,
  finalPrice,
  productId,
  image,
  quantity,
  stock,
  color,
  size,
  cartItemId,
}) => {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const userId = user?.id;

  // ✅ FIX: Convert prices to numbers before calculations
  const numericPrice = typeof price === 'string' ? parseFloat(price) : Number(price) || 0;
  const numericFinalPrice = typeof finalPrice === 'string' ? parseFloat(finalPrice) : Number(finalPrice) || 0;
  
  const displayPrice = numericFinalPrice > 0 ? numericFinalPrice : numericPrice;
  const totalPrice = displayPrice * (quantity || 1);
  const hasDiscount = numericPrice > numericFinalPrice;
  const discountPercent = hasDiscount 
    ? Math.round((1 - numericFinalPrice / numericPrice) * 100) 
    : 0;
  const discountAmount = hasDiscount ? (numericPrice - numericFinalPrice) * (quantity || 1) : 0;

  const handleRemove = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!userId) {
      toast({
        title: "Error",
        description: "User not found. Please login again.",
        variant: "destructive",
      });
      return;
    }

    dispatch(removeFromCart({ userId, cartItemId }))
      .unwrap()
      .then(() => {
        toast({
          title: "Removed",
          description: "Product removed from cart",
        });
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to remove item",
          variant: "destructive",
        });
      });
  };

  const handleQuantityDecrease = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!userId) return;

    if (quantity > 1) {
      dispatch(decreaseQuantity({ userId, cartItemId }))
        .unwrap()
        .catch((error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to decrease quantity",
            variant: "destructive",
          });
        });
    } else {
      handleRemove();
    }
  };

  const handleQuantityIncrease = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!userId) return;

    if (quantity >= (stock || 99)) {
      toast({
        title: "Maximum stock reached",
        description: `Only ${stock || 0} items available`,
        variant: "destructive",
      });
      return;
    }

    dispatch(increaseQuantity({ userId, cartItemId }))
      .unwrap()
      .catch((error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to increase quantity",
          variant: "destructive",
        });
      });
  };

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="p-4">
        {/* Product Header */}
        <div className="flex gap-3 mb-3">
          {/* Product Image */}
          <div className="relative">
            <img
              src={image || "/placeholder.jpg"}
              alt={name}
              className="w-16 h-16 object-cover rounded"
            />
            {hasDiscount && (
              <div className="absolute -top-1 -left-1 bg-red-500 text-white text-[10px] font-bold px-1 py-0.5 rounded">
                {discountPercent}% OFF
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1">
            <h3 className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2">
              {name}
            </h3>
            
            {(color || size) && (
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {color && color !== "Default" ? `${color}` : ""}
                {color && size && " • "}
                {size ? `Size: ${size}` : ""}
              </div>
            )}

            <div className="mt-2 flex items-center gap-2">
              <span className="text-base font-bold text-gray-900 dark:text-white">
                ₹{totalPrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                  ₹{(numericPrice * quantity).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Remove Button */}
          <button
            onClick={handleRemove}
            className="text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Remove item"
          >
            <X size={18} />
          </button>
        </div>

        {/* Price Details */}
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">
          <div className="flex justify-between mb-1">
            <span>₹{displayPrice.toFixed(2)} × {quantity} items</span>
            <span>₹{totalPrice.toFixed(2)}</span>
          </div>
          {hasDiscount && (
            <div className="flex justify-between text-green-600 dark:text-green-400">
              <span>You save</span>
              <span>₹{discountAmount.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Quantity Controls - Flipkart Style */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400 mr-3">Quantity:</span>
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded">
              <button
                onClick={handleQuantityDecrease}
                disabled={quantity <= 1}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <div className="w-10 h-8 flex items-center justify-center border-x border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                <span className="text-sm font-medium">{quantity}</span>
              </div>
              <button
                onClick={handleQuantityIncrease}
                disabled={quantity >= (stock || 99)}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Stock Status */}
          <div className="text-right">
            {stock === 0 ? (
              <div className="text-xs text-red-600 dark:text-red-400">
                Out of stock
              </div>
            ) : stock < 10 ? (
              <div className="text-xs text-amber-600 dark:text-amber-400">
                Only {stock} left!
              </div>
            ) : (
              <div className="text-xs text-green-600 dark:text-green-400">
                In stock
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartProduct;