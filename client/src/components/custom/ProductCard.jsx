import React, { useState } from "react";
import { starsGenerator } from "@/constants/helper";
import { toast } from "@/hooks/use-toast";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import useCartActions from "@/hooks/useCartActions";
import { Heart, ShoppingBag, Star, Sparkles, TrendingUp } from "lucide-react";
import { formatPrice, getImageUrl, getStockStatus } from "@/utils/productCard";
import {
  optimisticToggle,
  revertOptimisticToggle,
  toggleWishlist,
} from "@/redux/slices/wishlistSlice";

const ProductCard = ({
  _id,
  name = "Product Title",
  price = 0,
  rating = 0,
  reviewCount = 0,
  image = null,
  discountedPrice = 0,
  discount = 0,
  offerValidTill,
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
  const [imageError, setImageError] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // Get wishlist status from Redux
  const isWishlisted = wishlistStatus[_id] || false;

  // Optimize image with Cloudinary transformations
  const optimizeImg = (url) => {
    if (!url) return null;
    return url.replace("/upload/", "/upload/f_auto,q_auto,w_600/");
  };

  // Get image URL with fallback

  const displayImage = optimizeImg(
    getImageUrl({ image, variants, imageError })
  );

  // Check if offer is active
  const now = new Date();
  const isOfferActive =
    discount > 0 && (!offerValidTill || new Date(offerValidTill) >= now);

  // Calculate prices
  const finalPrice =
    isOfferActive && discountedPrice > 0 ? discountedPrice : price;
  const savings = price - finalPrice;
  const discountPercentage =
    discount || (savings > 0 ? Math.round((savings / price) * 100) : 0);

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

    try {
      await addToCart({
        userId: user.id,
        productId: _id,
        quantity: 1,
        price: finalPrice,
        color: variants?.[0]?.color || "Default",
        size: "",
        toast,
      });
    } finally {
      setIsAdding(false);
    }
  };
  const getErrorMessage = (error) => {
    if (!error) return "Please try again";
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    if (typeof error === 'object') return error.message || JSON.stringify(error);
    return String(error);
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
        title: result.action === "added" 
          ? "Added to wishlist ❤️" 
          : "Removed from wishlist",
        variant: "default",
      });
      
    } catch (error) {
      // ✅ Safe error handling
      const errorMessage = getErrorMessage(error);
      
      dispatch(revertOptimisticToggle(_id));
      toast({
        title: "Failed to update wishlist",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsToggling(false);
    }
  };
  const stockStatus = getStockStatus(stock);

  return (
    <div className="group relative">
      {/* Glow effect on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/20 via-pink-500/10 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />

      <div className="relative bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
        {/* TOP BADGES */}
        <div className="absolute top-3 left-3 right-3 z-10 flex justify-between">
          <div className="flex flex-col gap-1">
            {/* FEATURED BADGE */}
            {isFeatured && (
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-bold shadow-lg">
                <Sparkles size={8} />
                Featured
              </div>
            )}

            {/* BESTSELLER BADGE */}
            {isBestSeller && !isFeatured && (
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-emerald-600 to-green-600 text-white text-[10px] font-bold shadow-lg">
                <TrendingUp size={8} />
                Bestseller
              </div>
            )}

            {/* DISCOUNT BADGE */}
            {isOfferActive && discountPercentage > 0 && (
              <div className="px-2 py-1 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold shadow-lg animate-pulse">
                {discountPercentage}% OFF
              </div>
            )}
          </div>

          {/* WISHLIST BUTTON */}
          <button
            onClick={handleWishlistToggle}
            className="w-8 h-8 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 hover:scale-110 group/wishlist"
            aria-label={
              isWishlisted ? "Remove from wishlist" : "Add to wishlist"
            }
          >
            <Heart
              size={16}
              className={`transition-all duration-300 ${
                isWishlisted
                  ? "fill-red-500 text-red-500 scale-110"
                  : "text-gray-500 dark:text-gray-400 group-hover/wishlist:text-red-500"
              }`}
            />
          </button>
        </div>

        <Link to={`/product/${_id}`} className="block">
          {/* IMAGE SECTION */}
          <div className="relative pt-12 pb-4 px-4">
            <div className="w-full aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              {/* Image loading skeleton */}
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700" />
              )}

              {/* Product image */}
              <img
                loading="lazy"
                src={displayImage}
                alt={name}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                className={`w-full h-full object-contain transition-all duration-700 group-hover:scale-110 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
              />
            </div>
          </div>

          {/* CONTENT SECTION */}
          <div className="p-4 pt-0 space-y-3">
            {/* PRODUCT NAME */}
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 min-h-[2.5rem] leading-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              {name}
            </h3>

            {/* RATING SECTION - GREEN STYLING */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-2 py-1 rounded-lg">
                <Star size={10} className="fill-white" />
                <span className="text-xs font-bold">{rating.toFixed(1)}</span>
              </div>

              {reviewCount > 0 ? (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {reviewCount.toLocaleString()}{" "}
                  {reviewCount === 1 ? "Review" : "Reviews"}
                </span>
              ) : (
                <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                  Be the first to review
                </span>
              )}
            </div>

            {/* PRICE SECTION */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatPrice(finalPrice)}
                </span>

                {isOfferActive && price > finalPrice && (
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

              {/* Payment options */}
              {finalPrice > 0 && (
                <div className="text-[10px] text-gray-500 dark:text-gray-400">
                  or ₹{Math.round(finalPrice / 3)}/month for 3 months
                </div>
              )}
            </div>

            {/* STOCK STATUS */}
            <div
              className={`text-xs font-medium px-3 py-1.5 rounded-lg inline-flex items-center gap-2 ${stockStatus.bg} ${stockStatus.color} ${stockStatus.border}`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  stock <= 0
                    ? "bg-red-500"
                    : stock <= 5
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
              />
              <span>{stockStatus.text}</span>
            </div>

            {/* COLOR VARIANTS - BETTER STYLING */}
            {variants.length > 0 && variants[0].color && (
              <div className="space-y-2">
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  Available in {variants.length}{" "}
                  {variants.length === 1 ? "color" : "colors"}
                </div>
                <div className="flex gap-2">
                  {variants.slice(0, 4).map((variant, index) => (
                    <div
                      key={index}
                      className="relative w-7 h-7 rounded-full border-2 border-gray-300 dark:border-gray-600 hover:border-emerald-500 dark:hover:border-emerald-400 cursor-pointer transition-all duration-300 hover:scale-110 group/color"
                      style={{ backgroundColor: variant.color || "#ccc" }}
                      title={variant.color}
                    >
                      <div className="absolute inset-0 rounded-full bg-black/0 group-hover/color:bg-black/10 transition-all duration-300" />
                    </div>
                  ))}
                  {variants.length > 4 && (
                    <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 flex items-center justify-center group/color cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-300">
                      <span className="text-[9px] font-bold text-gray-600 dark:text-gray-400 group-hover/color:text-emerald-600">
                        +{variants.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ADD TO CART BUTTON - FULL WIDTH */}
            <button
              onClick={handleAddToCart}
              disabled={isAdding || stock <= 0}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                stock <= 0
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  : isAdding
                  ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 cursor-wait"
                  : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl active:scale-[0.98]"
              }`}
            >
              {isAdding ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding to Cart...
                </>
              ) : stock <= 0 ? (
                "Out of Stock"
              ) : (
                <>
                  <ShoppingBag size={16} />
                  Add to Cart
                </>
              )}
            </button>
          </div>
        </Link>
      </div>

      {/* SOLD OUT OVERLAY */}
    </div>
  );
};

export default ProductCard;
