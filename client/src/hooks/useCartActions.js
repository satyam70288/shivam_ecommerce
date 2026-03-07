// hooks/useCartActions.js
import { useDispatch } from "react-redux";
import { 
  addToCart, 
  removeFromCart, 
  increaseQuantity, 
  decreaseQuantity,
  clearCart,
  fetchCart,
  removeItemOptimistic
} from "@/redux/slices/cartSlice";
import { useToast } from "@/hooks/use-toast";

const useCartActions = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();

  // ✅ No need for getUserId - interceptor handles token
  // Cart functions should use token from interceptor, not userId from localStorage

  // ✅ UPDATED: Add to cart function
  const addToCartHandler = async ({
    productId,
    productData = null,
    quantity = 1,
    color = null,
    size = null,
    variantId = null,
    onSuccess,
    onError,
  }) => {
    try {
      // ✅ Call Redux thunk - userId ab nahi bhejna, interceptor token handle karega
      const result = await dispatch(addToCart({
        productId,
        quantity,
        color: color || "Default",
        size: size || "M",
        variantId,
      })).unwrap();
      
      // Show success toast
      toast({
        title: "✅ Added to cart",
        description: "Item added successfully",
        duration: 3000,
      });

      if (onSuccess) onSuccess(result);
      return result;
      
    } catch (error) {
      console.error("Add to cart error:", error);
      
      // Show error toast
      toast({
        title: "❌ Failed to add",
        description: error.message || "Please try again",
        variant: "destructive",
        duration: 3000,
      });
      
      if (onError) onError(error);
      throw error;
    }
  };

  // ✅ Remove from cart
  const removeFromCartHandler = async (cartItemId, onSuccess, onError) => {
    try {
      // Optimistic removal
      dispatch(removeItemOptimistic(cartItemId));

      const result = await dispatch(removeFromCart({ cartItemId })).unwrap();
      
      toast({
        title: "✅ Removed",
        description: "Item removed from cart",
        duration: 3000,
      });
      
      if (onSuccess) onSuccess(result);
      return result;
      
    } catch (error) {
      console.error("Remove from cart error:", error);
      
      toast({
        title: "❌ Failed to remove",
        description: error.message || "Please try again",
        variant: "destructive",
        duration: 3000,
      });
      
      if (onError) onError(error);
      throw error;
    }
  };

  // ✅ Increase quantity
  const increaseQuantityHandler = async (cartItemId, onSuccess, onError) => {
    try {
      const result = await dispatch(increaseQuantity({ cartItemId })).unwrap();
      
      if (onSuccess) onSuccess(result);
      return result;
      
    } catch (error) {
      console.error("Increase quantity error:", error);
      
      toast({
        title: "❌ Failed",
        description: error.message || "Could not update quantity",
        variant: "destructive",
        duration: 3000,
      });
      
      if (onError) onError(error);
      throw error;
    }
  };

  // ✅ Decrease quantity
  const decreaseQuantityHandler = async (cartItemId, onSuccess, onError) => {
    try {
      const result = await dispatch(decreaseQuantity({ cartItemId })).unwrap();
      
      if (onSuccess) onSuccess(result);
      return result;
      
    } catch (error) {
      console.error("Decrease quantity error:", error);
      
      toast({
        title: "❌ Failed",
        description: error.message || "Could not update quantity",
        variant: "destructive",
        duration: 3000,
      });
      
      if (onError) onError(error);
      throw error;
    }
  };

  // ✅ Clear cart
  const clearCartHandler = async (onSuccess, onError) => {
    try {
      const result = await dispatch(clearCart()).unwrap();
      
      toast({
        title: "✅ Cart cleared",
        description: "All items removed",
        duration: 3000,
      });
      
      if (onSuccess) onSuccess(result);
      return result;
      
    } catch (error) {
      console.error("Clear cart error:", error);
      
      toast({
        title: "❌ Failed",
        description: error.message || "Could not clear cart",
        variant: "destructive",
        duration: 3000,
      });
      
      if (onError) onError(error);
      throw error;
    }
  };

  // ✅ Fetch cart
  const fetchCartHandler = async (onSuccess, onError) => {
    try {
      const result = await dispatch(fetchCart()).unwrap();
      
      if (onSuccess) onSuccess(result);
      return result;
      
    } catch (error) {
      console.error("Fetch cart error:", error);
      
      // Don't show toast for 401 - interceptor handles redirect
      if (error.response?.status !== 401) {
        toast({
          title: "❌ Failed to load cart",
          description: error.message || "Please try again",
          variant: "destructive",
          duration: 3000,
        });
      }
      
      if (onError) onError(error);
      throw error;
    }
  };

  return {
    addToCart: addToCartHandler,
    removeFromCart: removeFromCartHandler,
    increaseQuantity: increaseQuantityHandler,
    decreaseQuantity: decreaseQuantityHandler,
    clearCart: clearCartHandler,
    fetchCart: fetchCartHandler,
  };
};

export default useCartActions;