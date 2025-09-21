import React from "react";
import { starsGenerator } from "@/constants/helper";
import { toast } from "@/hooks/use-toast";
import { addToCart } from "@/redux/slices/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import useCartActions from "@/hooks/useCartActions";
const ProductCard = ({
  _id,
  name = "Product Title",
  price = 2000,
  rating = 4,
  image = null, // default null
  discountedPrice = price,
  discount = 0,
  offerValidTill,
  variants = [], // add variants prop
}) => {
  const slug = name.split(" ").join("-");
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { addToCart } = useCartActions();

  const now = new Date();
  const isOfferActive = offerValidTill
    ? new Date(offerValidTill) >= now && discount > 0
    : false;
  const displayPrice = isOfferActive ? discountedPrice : price;
  const displayImage =
    image?.url ||
    (variants.length > 0 && variants[0].images?.[0]?.url) ||
    "https://images.pexels.com/photos/3801990/pexels-photo-3801990.jpeg?auto=compress&cs=tinysrgb&w=600";
  
    const handleAddToCart = (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    addToCart({
      userId: user.id,
      productId: _id,
      quantity: 1,
      price: displayPrice,
      color: variants?.[0]?.color || "Default", // adjust logic if multiple colors
      size: "", // optional, you can add size selection later
      toast,
    });
  };

  return (
    <div className="relative group border rounded-2xl overflow-hidden shadow-md transform transition-transform duration-300 hover:scale-[1.02] bg-white dark:bg-zinc-900">
      <Link to={`/product/${slug}`}>
        {/* Product Image: fixed height for all screen sizes */}
        <div className="w-full h-56 lg:h-80 overflow-hidden">
          <img src={displayImage} alt={name} className="object-cover w-full h-full" />
        </div>

        {/* Product Info for small screens */}
        <div className="p-3 lg:hidden">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {name}
          </h3>

          {/* Rating */}
          <div className="flex items-center mt-1">
            <div className="flex text-xs">{starsGenerator(rating)}</div>
            <span className="text-xs text-gray-500 ml-1">
              ({rating.toFixed(1)})
            </span>
          </div>

          {/* Price */}
          <div className="mt-2 flex items-baseline gap-1">
            {isOfferActive && discount > 0 && (
              <span className="text-xs text-gray-400 line-through">
                ₹{price.toFixed(2)}
              </span>
            )}
            <span className="text-lg font-bold text-gray-900 dark:text-yellow-400">
              ₹{(discountedPrice || price).toFixed(2)}
            </span>
          </div>

          {/* Discount / No Discount Badge */}
          {isOfferActive ? (
            <span className="inline-block mt-1 bg-yellow-300 text-yellow-900 text-xs px-1.5 py-0.5 rounded-full">
              {discount}% OFF
            </span>
          ) : (
            <span className="inline-block mt-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              Non-Discount Price
            </span>
          )}

          {/* Add to Cart Button */}
          <button
            className="mt-2 w-full py-1.5 bg-yellow-500 text-gray-900 text-sm font-medium rounded-md hover:bg-yellow-600 transition-colors"
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
        </div>

        {/* Hover info for large screens only */}
        <div
          className="
        px-3 gap-1 py-2 absolute bg-white dark:bg-zinc-900 w-full bottom-0 
        opacity-0 translate-y-[3rem]
        lg:opacity-0 lg:translate-y-[3rem]
        lg:group-hover:opacity-100 lg:group-hover:translate-y-0
        transform transition-all ease-in-out duration-300
        rounded-xl pointer-events-none lg:pointer-events-auto
        hidden lg:grid
        max-h-screen overflow-hidden
      "
          style={{ maxHeight: "120px" }} // optional inline style for max height
        >
          <h2 className="text-lg font-semibold">{name}</h2>

          <div className="flex justify-between items-center">
            <div className="flex">{starsGenerator(rating)}</div>
            <span className="text-sm font-medium">
              ₹{displayPrice.toFixed(2)}
            </span>
          </div>

          {isOfferActive && (
            <span className=" lg:w-16 inline-block mt-1 bg-yellow-300 text-yellow-900 text-xs px-1.5 py-0.5 rounded-full">
              {discount}% OFF
            </span>
          )}

          <div className="text-sm text-primary underline mt-1">
            View Product
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
