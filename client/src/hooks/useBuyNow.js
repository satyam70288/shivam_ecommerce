import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const useBuyNow = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((s) => s.auth);

  const buyNow = ({ productId, quantity }) => {


    if (!productId) {
      console.error("Missing productId");
      return;
    }

    if (!isAuthenticated) {
  
      navigate("/login");
      return;
    }

  
    navigate(`/checkout?productId=${productId}&qty=${quantity || 1}`);
  };

  return { buyNow };
};

export default useBuyNow;
