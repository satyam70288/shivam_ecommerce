import React, { useState } from "react";
import { starsGenerator } from "@/constants/helper";
import { toast } from "@/hooks/use-toast";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import useCartActions from "@/hooks/useCartActions";
import { Heart } from "lucide-react";

const ProductCard = ({
  _id,
  name = "Product Title",
  price = 2000,
  rating = 4,
  image = null,
  discountedPrice = price,
  discount = 0,
  offerValidTill,
  variants = [],
}) => {
  const slug = name.split(" ").join("-");
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { addToCart } = useCartActions();

  const [wishlisted, setWishlisted] = useState(false);
  const [bursts, setBursts] = useState([]);

  const createBurst = () => {
    const items = Array.from({ length: 6 }).map(() => ({
      id: Math.random(),
      tx: (Math.random() - 0.5) * 35,
      ty: (Math.random() - 0.5) * 35,
    }));
    setBursts(items);
    setTimeout(() => setBursts([]), 800);
  };

  const toggleWishlist = (e) => {
    e.preventDefault();
    setWishlisted(!wishlisted);

    if (!wishlisted) createBurst();

    toast({
      title: !wishlisted ? "Added to Wishlist ❤️" : "Removed from Wishlist",
    });
  };

  const optimizeImg = (url) =>
    url?.replace("/upload/", "/upload/f_auto,q_auto,w_400/");

  const rawImage =
    image?.url ||
    variants[0]?.images?.[0]?.url ||
    "https://images.pexels.com/photos/3801990/pexels-photo-3801990.jpeg";

  const displayImage = optimizeImg(rawImage);

  const now = new Date();
  const isOfferActive = discount > 0 && offerValidTill
    ? new Date(offerValidTill) >= now
    : false;

  const displayPrice = isOfferActive ? discountedPrice : price;

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
      color: variants?.[0]?.color || "Default",
      size: "",
      toast,
    });
  };

  return (
    <div
      className="
      relative border rounded-xl overflow-hidden shadow-md 
      bg-white dark:bg-zinc-900 
      transition-all duration-300
      hover:shadow-lg hover:-translate-y-1
    "
    >
      <Link to={`/product/${slug}`}>
        
        {/* ❤️ WISHLIST BUTTON */}
        <button
          onClick={toggleWishlist}
          className="
            absolute top-2 right-2 z-20 p-1.5 rounded-full
            bg-white dark:bg-zinc-800 shadow
            hover:shadow-md transition-all
          "
        >
          <Heart
            size={18}
            className={`
              transition-all duration-300
              ${wishlisted ? "fill-red-500 text-red-500 scale-110" : "text-gray-500"}
            `}
          />

          {/* BURST HEARTS */}
          <div className="absolute inset-0 pointer-events-none">
            {bursts.map((b) => (
              <span
                key={b.id}
                className="
                  absolute text-[9px] 
                  opacity-0
                  animate-[burst_0.8s_ease-out_forwards]
                "
                style={{
                  left: "50%",
                  top: "50%",
                  transform: `translate(-50%, -50%)`,
                  "--tw-translate-x": `${b.tx}px`,
                  "--tw-translate-y": `${b.ty}px`,
                }}
              >
                ❤️
              </span>
            ))}
          </div>

          {/* INLINE KEYFRAMES */}
          <style>
            {`
              @keyframes burst {
                0%   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) scale(0.6); }
              }
            `}
          </style>
        </button>

        {/* IMAGE — COMPACT HEIGHT */}
        <div className="w-full h-44 lg:h-56 overflow-hidden bg-gray-100">
          <img
            loading="lazy"
            src={displayImage}
            alt={name}
            className="
              w-full h-full object-cover 
              transition-transform duration-500
              group-hover:scale-105
            "
          />
        </div>

        {/* CONTENT — COMPACT BEAUTIFUL */}
        <div className="p-3 space-y-1.5">
          
          <h3 className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-1">
            {name}
          </h3>

          {/* ⭐ Rating */}
          <div className="flex items-center gap-1">
            <div className="flex text-yellow-400 text-[11px]">
              {starsGenerator(rating)}
            </div>
            <span className="text-[10px] text-gray-500">
              ({rating.toFixed(1)})
            </span>
          </div>

          {/* PRICE ROW */}
          <div className="flex items-center gap-2">
            {isOfferActive && (
              <span className="text-[10px] text-gray-400 line-through">
                ₹{price.toFixed(2)}
              </span>
            )}

            <span className="text-[15px] font-bold text-gray-900 dark:text-yellow-400">
              ₹{displayPrice.toFixed(2)}
            </span>
          </div>

          {/* DISCOUNT TAG */}
          {isOfferActive ? (
            <span className="inline-block bg-yellow-300 text-yellow-900 text-[10px] px-1.5 py-[2px] rounded-full font-medium">
              {discount}% OFF
            </span>
          ) : (
            <span className="inline-block bg-red-500 text-white text-[10px] px-1.5 py-[2px] rounded-full">
              No Discount
            </span>
          )}

          {/* ADD TO CART — SLIM, PREMIUM */}
          <button
            onClick={handleAddToCart}
            className="
              mt-2 w-full py-1.5 text-[12px] font-semibold rounded-md
              bg-yellow-500 text-gray-900 
              hover:bg-yellow-600 
              transition-all
            "
          >
            Add to Cart
          </button>

        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
