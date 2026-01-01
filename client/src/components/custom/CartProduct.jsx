import { Colors } from "@/constants/colors";
import { useToast } from "@/hooks/use-toast";
import { Minus, Plus, Trash } from "lucide-react";
import React from "react";
import { useSelector } from "react-redux";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useRazorpay from "@/hooks/use-razorpay";
import useCart from "@/hooks/useCart";
import useCartActions from "@/hooks/useCartActions";

const CartProduct = ({
  name,
  price,
  cartItemId,
  productId,
  image,
  quantity,
  stock,
  blacklisted,
  color,
  size,
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { generatePayment, verifyPayment } = useRazorpay();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { fetchCart } = useCart();
  const { decreaseQuantity, increaseQuantity, removeItem } = useCartActions();
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  // Calculate discount
  const originalPrice = Math.round(price * 1.33);
  const discount = originalPrice - price;
  const discountPercentage = Math.round((discount / originalPrice) * 100);

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const order = await generatePayment(price * quantity);
    await verifyPayment(
      order,
      [{ id: productId, quantity, color, size }],
      "123 Main street"
    );
    fetchCart();
  };

  const handleRemove = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user && !cartItemId) return;

      await axios.delete(`${import.meta.env.VITE_API_URL}/cart/remove`, {
        data: { userId: user.id, cartItemId },
      });

      toast({ title: "Product removed from cart" });
      fetchCart(user.id);
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to remove product" });
    }
  };

  const handleQuantityDecrease = () => {
    if (quantity > 1) {
      decreaseQuantity({
        userId,
        cartItemId,
        toast,
      });
    } else {
      removeItem({ userId, cartItemId, toast });
    }
  };

  const handleQuantityIncrease = () => {
    if (stock === quantity) {
      toast({ title: "Maximum stock reached" });
    } else {
      increaseQuantity({ userId, cartItemId, toast });
    }
  };

  return (
    <div className="flex gap-3 p-3 border-b border-gray-200 dark:border-gray-700">
      {/* Product Image - Same height as details */}
      <div className="flex-shrink-0 w-20 h-20">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover rounded"
        />
      </div>

      {/* Product Details - Same height as image */}
      <div className="flex-1 min-w-0 h-20 flex flex-col justify-between">
        {/* Only product name - single line */}
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1 text-left">
          {name}
        </h3>

        {/* Price only - simple */}
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-gray-900 dark:text-white">
            ₹{price?.toLocaleString()}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 line-through">
            ₹{originalPrice?.toLocaleString()}
          </span>
        </div>

        {/* Only quantity controls - very simple */}
        <div className="flex items-center">
          <button
            onClick={handleQuantityDecrease}
            className="w-6 h-6 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-l"
            disabled={quantity <= 1}
          >
            <Minus size={12} />
          </button>
          
          <div className="w-8 h-6 flex items-center justify-center border-y border-gray-300 dark:border-gray-600">
            <span className="text-xs font-medium">{quantity}</span>
          </div>
          
          <button
            onClick={handleQuantityIncrease}
            className="w-6 h-6 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-r"
            disabled={quantity >= stock}
          >
            <Plus size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartProduct;