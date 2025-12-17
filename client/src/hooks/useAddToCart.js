import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import useCartActions from "@/hooks/useCartActions";
import { useToast } from "@/hooks/use-toast";

const useAddToCart = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((s) => s.auth);
  const { addToCart } = useCartActions();
  const { toast } = useToast();

  const handleAddToCart = ({
    productId,
    quantity = 1,
    price,
    color = null,
    size = null,
    setQuantityCallback,
  }) => {
    // if (!isAuthenticated) {
    //   navigate("/login");
    //   return;
    // }

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.id) return;

    addToCart({
      userId: user.id,
      productId,
      quantity,
      price,
      color,
      size,
      toast,
      setQuantityCallback,
    });
  };

  return { handleAddToCart };
};

export default useAddToCart;
