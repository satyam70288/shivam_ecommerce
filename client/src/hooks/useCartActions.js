// hooks/useCartActions.js
import { useDispatch } from "react-redux";
import { 
  addToCart, 
  removeFromCart, 
  increaseQuantity, 
  decreaseQuantity,
  clearCart,
  fetchCart,
  addItemOptimistic,
  removeItemOptimistic
} from "@/redux/slices/cartSlice";
import { useToast } from "@/hooks/use-toast";

const useCartActions = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const getUserId = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.id;
  };

  // ✅ UPDATED: Add to cart function with variant support
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
    const userId = getUserId();
    if (!userId) {
      const error = new Error("User not logged in");
      if (onError) onError(error);
      throw error;
    }

    // // Optimistic update for immediate UI feedback
    // if (productData) {
    //   const optimisticItem = {
    //     cartItemId: `temp-${Date.now()}`,
    //     productId,
    //     name: productData.name,
    //     price: productData.price || 0,
    //     sellingPrice: productData.sellingPrice || productData.price || 0,
    //     finalPrice: productData.sellingPrice || productData.price || 0,
    //     quantity,
    //     color: color || "Default",
    //     size: size || "M",
    //     image: productData.images?.[0]?.url || productData.image || "",
    //     lineTotal: ((productData.sellingPrice || productData.price || 0) * quantity).toFixed(2),
    //     variantId,
    //   };
      
    //   dispatch(addItemOptimistic(optimisticItem));
    // }

    try {
      // Call Redux thunk
      const result = await dispatch(addToCart({
        userId,
        productId,
        quantity,
        color: color || "Default",
        size: size || "M",
        variantId,
      })).unwrap();
      
      // Trigger global cart update event
      // window.dispatchEvent(new CustomEvent("cartUpdated"));

      // Call success callback
      if (onSuccess) onSuccess(result);
      dispatch(fetchCart(userId));

      return result;
    } catch (error) {
      // Revert optimistic update on error
      if (productData) {
        dispatch(removeItemOptimistic(`temp-${Date.now()}`));
      }
      
      if (onError) onError(error);
      throw error;
    }
  };

  // Remove from cart
  const removeFromCartHandler = async (cartItemId, onSuccess, onError) => {
    const userId = getUserId();
    if (!userId) {
      const error = new Error("User not logged in");
      if (onError) onError(error);
      throw error;
    }

    // Optimistic removal
    dispatch(removeItemOptimistic(cartItemId));

    try {
      const result = await dispatch(removeFromCart({ userId, cartItemId })).unwrap();
      
      window.dispatchEvent(new CustomEvent("cartUpdated"));
      
      if (onSuccess) onSuccess(result);
      return result;
    } catch (error) {
      // On error, refetch cart to restore state
      dispatch(fetchCart(userId));
      if (onError) onError(error);
      throw error;
    }
  };

  // Increase quantity
  const increaseQuantityHandler = async (cartItemId, onSuccess, onError) => {
    const userId = getUserId();
    if (!userId) {
      const error = new Error("User not logged in");
      if (onError) onError(error);
      throw error;
    }

    try {
      const result = await dispatch(increaseQuantity({ userId, cartItemId })).unwrap();
      
      window.dispatchEvent(new CustomEvent("cartUpdated"));
      
      if (onSuccess) onSuccess(result);
      return result;
    } catch (error) {
      if (onError) onError(error);
      throw error;
    }
  };

  // Decrease quantity
  const decreaseQuantityHandler = async (cartItemId, onSuccess, onError) => {
    const userId = getUserId();
    if (!userId) {
      const error = new Error("User not logged in");
      if (onError) onError(error);
      throw error;
    }

    try {
      const result = await dispatch(decreaseQuantity({ userId, cartItemId })).unwrap();
      
      window.dispatchEvent(new CustomEvent("cartUpdated"));
      
      if (onSuccess) onSuccess(result);
      return result;
    } catch (error) {
      if (onError) onError(error);
      throw error;
    }
  };

  // Clear cart
  const clearCartHandler = async (onSuccess, onError) => {
    const userId = getUserId();
    if (!userId) {
      const error = new Error("User not logged in");
      if (onError) onError(error);
      throw error;
    }

    try {
      const result = await dispatch(clearCart(userId)).unwrap();
      
      window.dispatchEvent(new CustomEvent("cartUpdated"));
      
      if (onSuccess) onSuccess(result);
      return result;
    } catch (error) {
      if (onError) onError(error);
      throw error;
    }
  };

  // Fetch cart
  const fetchCartHandler = async (onSuccess, onError) => {
    const userId = getUserId();
    if (!userId) {
      const error = new Error("User not logged in");
      if (onError) onError(error);
      throw error;
    }

    try {
      const result = await dispatch(fetchCart(userId)).unwrap();
      
      if (onSuccess) onSuccess(result);
      return result;
    } catch (error) {
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