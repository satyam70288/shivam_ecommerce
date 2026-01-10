import React, { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import useCartActions from "@/hooks/useCartActions";
import { Heart, ShoppingBag, Star, Sparkles } from "lucide-react";
import { formatPrice, getImageUrl, getStockStatus } from "@/utils/productCard";
import {
  optimisticToggle,
  revertOptimisticToggle,
  toggleWishlist,
} from "@/redux/slices/wishlistSlice";
import { addToCartThunk } from "@/redux/thunks/cartThunk";

const ProductCard = ({
  _id,
  name = "Product Title",
  price = 0,
  rating = 0,
  reviewCount = 0,
  image = null, isOfferActive,   // 👈 ADD THIS
  discountedPrice = 0,
  discount = 0,
  variants = [],
  stock = 0,
  isFeatured = false,
  isBestSeller = false,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { wishlistStatus } = useSelector((state) => state.wishlist);
  const { addToCart } = useCartActions();

  const [imageLoaded, setImageLoaded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const isWishlisted = wishlistStatus[_id] || false;
 const finalPrice = isOfferActive && discountedPrice > 0
  ? discountedPrice
  : price;

  const savings = price - finalPrice;
 const discountPercentage =
  isOfferActive && discount > 0 ? discount : 0;

  const displayImage = getImageUrl({ image, variants });

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setIsAdding(true);
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      setIsAdding(false);
      return;
    }

    dispatch(
    addToCartThunk({
      userId: user.id,
      productId: _id,
      quantity: 1,
      price: finalPrice,
      color: variants?.[0]?.color || "Default",
      size: "",
      toast,
    })
  ).finally(() => {
    setIsAdding(false);
  });
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast({
        title: "Please login first",
        description: "Login to add items to wishlist",
        variant: "destructive",
      });
      return;
    }

    if (isToggling) return;

    setIsToggling(true);
    dispatch(optimisticToggle(_id));

    try {
      const result = await dispatch(toggleWishlist(_id)).unwrap();

      toast({
        title:
          result.action === "added"
            ? "Added to wishlist ❤️"
            : "Removed from wishlist",
        variant: "default",
      });
    } catch (error) {
      dispatch(revertOptimisticToggle(_id));
      toast({
        title: "Failed to update wishlist",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsToggling(false);
    }
  };

  const stockStatus = getStockStatus(stock);

  return (
    <div className="group relative font-sans">
      {/* SUBTLE HOVER EFFECT */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/0 to-gray-100/0 group-hover:from-gray-50/50 group-hover:to-gray-100/50 dark:group-hover:from-gray-800/30 dark:group-hover:to-gray-900/30 rounded-xl transition-all duration-300 font-sans" />

      <div className="relative bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden h-full flex flex-col">
        {/* ========== ABSOLUTE POSITIONED BADGES ========== */}
        {/* HEART BUTTON - Top Right */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 hover:scale-110"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            size={16}
            className={`transition-all duration-300 ${
              isWishlisted
                ? "fill-red-500 text-red-500"
                : "text-gray-500 dark:text-gray-400 hover:text-red-500"
            }`}
          />
        </button>

        {/* OFFER BADGES - Top Left */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <div className="px-2.5 py-1 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white text-[11px] font-bold shadow-md">
              {discountPercentage}% OFF
            </div>
          )}

          {/* Featured/Bestseller */}
          {isFeatured && (
            <div className="px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[11px] font-bold shadow-md flex items-center gap-1">
              <Sparkles size={10} />
              Featured
            </div>
          )}

          {isBestSeller && !isFeatured && (
            <div className="px-2.5 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 text-white text-[11px] font-bold shadow-md">
              Bestseller
            </div>
          )}
        </div>
        {/* ========== END ABSOLUTE BADGES ========== */}

        <Link to={`/product/${_id}`} className="block flex-grow">
          {/* IMAGE SECTION - Less padding now */}
          <div className="pt-8 pb-3 px-4">
            <div className="w-full aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              {/* Image loading skeleton */}
              {!imageLoaded && (
                <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg" />
              )}

              {/* Product image */}
              <img
                loading="lazy"
                src={displayImage}
                alt={name}
                onLoad={() => setImageLoaded(true)}
                className={`w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
              />
            </div>
          </div>

          {/* CONTENT SECTION - Compact */}
          <div className="px-4 pb-3 space-y-1 flex-grow">
            {/* PRODUCT NAME - 2 lines */}
            <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate leading-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors pb-1">
              {name}
            </h3>

            {/* RATING - Compact */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-2 py-1 rounded-lg">
                <Star size={12} className="fill-white" />
                <span className="text-xs font-bold">{rating.toFixed(1)}</span>
              </div>

              {reviewCount > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({reviewCount})
                </span>
              )}
            </div>

            {/* PRICE SECTION */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatPrice(finalPrice)}
                </span>

                {discountedPrice > 0 && price > discountedPrice && (
                  <span className="text-sm text-gray-400 dark:text-gray-500 line-through">
                    {formatPrice(price)}
                  </span>
                )}

                {savings > 0 && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full ml-auto">
                    Save {formatPrice(savings)}
                  </span>
                )}
              </div>
            </div>

            
          </div>
        </Link>

        {/* ADD TO CART BUTTON - Compact */}
        <div className="px-4 pb-4">
          <button
            onClick={handleAddToCart}
            disabled={isAdding || stock <= 0}
            className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
              stock <= 0
                ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                : isAdding
                ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 cursor-wait"
                : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow hover:shadow-md active:scale-[0.98]"
            }`}
          >
            {isAdding ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Adding...
              </>
            ) : stock <= 0 ? (
              "Out of Stock"
            ) : (
              <>
                <ShoppingBag size={14} />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
