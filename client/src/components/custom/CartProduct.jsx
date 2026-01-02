import { Minus, Plus, X } from "lucide-react";
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  increaseQtyThunk,
  decreaseQtyThunk,
  removeItemThunk,
} from "@/redux/thunks/cartThunk";

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

  const displayPrice = finalPrice ?? price;
  const totalPrice = displayPrice * quantity;
  const hasDiscount = price > finalPrice;
  const discountPercent = hasDiscount ? Math.round((1 - finalPrice / price) * 100) : 0;

  const handleRemove = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    dispatch(
      removeItemThunk({
        userId,
        cartItemId,
        color,
        size,
        toast,
      })
    );
  };

  const handleQuantityDecrease = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (quantity > 1) {
      dispatch(
        decreaseQtyThunk({
          userId,
          cartItemId,
          color,
          size,
          toast,
        })
      );
    } else {
      handleRemove();
    }
  };

  const handleQuantityIncrease = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (quantity >= stock) {
      toast({
        title: "Maximum stock reached",
        description: `Only ${stock} items available`,
      });
      return;
    }

    dispatch(
      increaseQtyThunk({
        userId,
        cartItemId,
        color,
        size,
        toast,
      })
    );
  };

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="p-4">
        {/* Product Header */}
        <div className="flex gap-3 mb-3">
          {/* Product Image */}
          <div className="relative">
            <img
              src={image}
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
                  ₹{(price * quantity).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Remove Button */}
          <button
            onClick={handleRemove}
            className="text-gray-400 hover:text-red-500"
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
              <span>₹{((price - finalPrice) * quantity).toFixed(2)}</span>
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
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40"
              >
                <Minus size={14} />
              </button>
              <div className="w-10 h-8 flex items-center justify-center border-x border-gray-300 dark:border-gray-600">
                <span className="text-sm font-medium">{quantity}</span>
              </div>
              <button
                onClick={handleQuantityIncrease}
                disabled={quantity >= stock}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Stock Status */}
          <div className="text-right">
            {stock < 10 ? (
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