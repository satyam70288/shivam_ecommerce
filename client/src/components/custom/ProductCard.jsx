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
  console.log(_id,"id")
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
  const isOfferActive =
    discount > 0 && offerValidTill ? new Date(offerValidTill) >= now : false;

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
    group relative rounded-xl overflow-hidden
    bg-white dark:bg-zinc-900
    border border-gray-200 dark:border-zinc-800
    shadow-sm hover:shadow-lg
    transition-all duration-300 ease-out
    hover:-translate-y-1
  "
    >
      <Link to={`/product/${_id}`}>
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
              ${
                wishlisted
                  ? "fill-red-500 text-red-500 scale-110"
                  : "text-gray-500"
              }
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
        {isOfferActive && (
          <div
            className="
        absolute top-3 left-3 z-10
        px-2 py-1 rounded-full
        bg-gradient-to-r from-red-500 to-orange-500
        shadow-lg
      "
          >
            <span className="text-[10px] font-bold text-white tracking-wider">
              {discount}% OFF
            </span>
          </div>
        )}
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
        <div className="p-4 space-y-2.5 bg-white dark:bg-zinc-900 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
  
  {/* PRODUCT NAME */}
  <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug">
    {name}
  </h3>

  {/* ⭐ RATING */}
  <div className="flex items-center gap-1">
    <div className="flex text-yellow-400 text-[12px]">
      {starsGenerator(rating)}
    </div>
    <span className="text-[11px] text-gray-500">
      {rating.toFixed(1)}
    </span>
  </div>

  {/* PRICE */}
  <div className="flex items-center justify-between">
  {/* PRICE BLOCK */}
  <div className="flex items-baseline gap-2">
    <span className="text-lg font-bold text-gray-900 dark:text-yellow-400">
      ₹{displayPrice.toFixed(2)}
    </span>

    {isOfferActive && (
      <span className="text-xs text-gray-400 line-through">
        ₹{price.toFixed(2)}
      </span>
    )}
  </div>

  {/* DISCOUNT BADGE */}
  {isOfferActive && (
    <span className="
      bg-gradient-to-r from-green-400 to-yellow-500
      text-gray-900 text-[11px]
      px-2 py-[3px]
      rounded-full font-bold
      shadow-sm
    ">
      {discount}% OFF
    </span>
  )}
</div>


  {/* DISCOUNT BADGE */}
  

  {/* CTA */}
  <button
  onClick={handleAddToCart}
  className="
    mt-3 w-full py-2.5 text-sm font-bold rounded-xl
    text-gray-900
    bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600
    hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700
    shadow-md hover:shadow-lg
    active:scale-[0.97]
    transition-all duration-200
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
