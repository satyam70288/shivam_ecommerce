import axios from "axios";
import { useDispatch } from "react-redux";
import { setCart } from "@/redux/slices/cartSlice";
import useCart from "./useCart";

const useCartActions = () => {
  const dispatch = useDispatch();
  const { fetchCart } = useCart();

  const addToCart = async ({
    userId,
    productId,
    quantity,
    price,
    color,
    size,
    toast,
    setQuantityCallback, // optional: reset quantity after adding
  }) => {
    try {
      if (!userId) return;

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/add`, {
        userId,
        productId,
        quantity,
        price,
        color,
        size,
      });

      if (res.data.success) {
        // ✅ Fetch updated cart from backend
        await fetchCart(userId);

        if (setQuantityCallback) setQuantityCallback(1); // reset quantity if needed
        if (toast) toast({ title: "Product added to cart" });
      } else {
        if (toast) toast({ title: "Failed to add product to cart" });
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      if (toast) toast({ title: "Failed to add product to cart" });
    }
  };

  // 2. Decrease quantity by 1
  const decreaseQuantity = async ({ userId, cartItemId, toast }) => {
    try {
      if (!userId) return;

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/cart/decrease`,
        {
          userId,
          cartItemId, // ✅ backend expects cartItemId
        }
      );

      if (res.data.success) {
        await fetchCart(userId); // ✅ backend se fresh cart
        if (toast) toast({ title: "Quantity decreased" });
      }
    } catch (error) {
      console.error("Decrease quantity error:", error);
      if (toast) toast({ title: "Failed to decrease quantity" });
    }
  };

  // 3. Remove item completely
  const removeFromCart = async ({ userId, productId, color, size, toast }) => {
    try {
      if (!userId) return;

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/remove`, {
        userId,
        productId,
        color,
        size,
      });

      if (res.data.success) {
        await fetchCart(userId);
        if (toast) toast({ title: "Item removed from cart" });
      }
    } catch (error) {
      console.error("Remove from cart error:", error);
      if (toast) toast({ title: "Failed to remove item" });
    }
  };

  // 4. Increase quantity by 1
const increaseQuantity = async ({ userId, cartItemId, toast }) => {
  try {
    if (!userId) return;

    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/cart/increase`,
      { userId, cartItemId } // backend expects cartItemId
    );

    if (res.data.success) {
      await fetchCart(userId); // refresh cart
      if (toast) toast({ title: "Quantity increased" });
    }
  } catch (error) {
    console.error("Increase quantity error:", error);
    if (toast) toast({ title: "Failed to increase quantity" });
  }
};


  return { addToCart, removeFromCart, decreaseQuantity,increaseQuantity };
};

export default useCartActions;
