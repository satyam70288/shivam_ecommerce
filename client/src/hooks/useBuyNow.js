import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const useBuyNow = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((s) => s.auth);

  const buyNow = ({ productId, quantity }) => {
    console.log("INSIDE useBuyNow", productId, quantity);

    if (!productId) {
      console.error("Missing productId");
      return;
    }

    if (!isAuthenticated) {
      console.log("NOT AUTHENTICATED → LOGIN");
      navigate("/login");
      return;
    }

    console.log("NAVIGATING TO CHECKOUT");
    navigate(`/checkout?productId=${productId}&qty=${quantity || 1}`);
  };

  return { buyNow };
};

export default useBuyNow;
