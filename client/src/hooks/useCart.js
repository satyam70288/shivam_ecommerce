import { setCart } from "@/redux/slices/cartSlice";
import axios from "axios";
import { useDispatch } from "react-redux";

const useCart = () => {
  const dispatch = useDispatch();

  const fetchCart = async (userId) => {
    try {
      if (!userId) return;

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/cart/${userId}`);
   
      if (res.data.success && res.data.cart) {
        dispatch(setCart(res.data.cart));
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    }
  };

  return { fetchCart };
};

export default useCart;
