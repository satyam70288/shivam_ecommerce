import React, { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingBag, Star, Sparkles } from "lucide-react";
import { formatPrice, getImageUrl, getStockStatus } from "@/utils/productCard";
import {
  optimisticToggle,
  revertOptimisticToggle,
  toggleWishlist,
} from "@/redux/slices/wishlistSlice";
import { addToCart } from "@/redux/slices/cartSlice"; // ✅ Correct import
import useCartActions from "@/hooks/useCartActions"; // ✅ Use hook instead

const ProductCard = ({
  _id,
  name = "Product Title",
  price = 0,
  rating = 0,
  reviewCount = 0,
  image = null,
  isOfferActive = false,
  discountedPrice = 0,
  discount = 0,
  variants = [],
  stock = 0,
  isFeatured = false,
  isBestSeller = false,
  slug, // Add slug for product link
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { wishlistStatus } = useSelector((state) => state.wishlist);
  
  // ✅ CORRECT: Use cart actions hook
  const { addToCart: addToCartHandler } = useCartActions();

  const [imageLoaded, setImageLoaded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const isWishlisted = wishlistStatus[_id] || false;
  
  // Calculate final price
  const finalPrice = isOfferActive && discountedPrice > 0
    ? discountedPrice
    : price;

  const savings = price - finalPrice;
  const discountPercentage = isOfferActive && discount > 0 ? discount : 0;
  const displayImage = getImageUrl({ image, variants });
  const stockStatus = getStockStatus(stock);

  // ✅ CORRECT: Add to cart function
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setIsAdding(true);

    try {
      // Get first available variant or default
      const firstVariant = variants?.[0];
      const color = firstVariant?.color || "Default";
      const size = firstVariant?.size || "M";
      const variantId = firstVariant?._id;

      // Prepare product data for optimistic update
      const productData = {
        _id,
        name,
        price: finalPrice,
        images: [{ url: displayImage }],
        variants: variants,
      };

      // ✅ Use hook instead of direct dispatch
      await addToCartHandler({
        productId: _id,
        productData, // For optimistic update
        quantity: 1,
        color,
        size,
        variantId,
      });

      // Show success toast
      toast({
        title: "✅ Added to cart!",
        description: `${name} added to cart successfully`,
        duration: 3000,
      });

      // Optional: Trigger cart drawer to open
      // window.dispatchEvent(new CustomEvent("openCartDrawer"));

    } catch (error) {
      console.error("Add to cart error:", error);
      toast({
        title: "❌ Failed to add to cart",
        description: error.message || "Please try again",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsAdding(false);
    }
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

  // Product link - use slug if available, otherwise ID
  const productLink = slug ? `/product/${slug}` : `/product/${_id}`;

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
          disabled={isToggling}
        >
          <Heart
            size={16}
            className={`transition-all duration-300 ${
              isWishlisted
                ? "fill-red-500 text-red-500"
                : "text-gray-500 dark:text-gray-400 hover:text-red-500"
            } ${isToggling ? "opacity-50" : ""}`}
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

        <Link to={productLink} className="block flex-grow">
          {/* IMAGE SECTION */}
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

          {/* CONTENT SECTION */}
          <div className="px-4 pb-3 space-y-1 flex-grow">
            {/* PRODUCT NAME */}
            <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate leading-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors pb-1">
              {name}
            </h3>

            {/* RATING */}
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

        {/* ADD TO CART BUTTON */}
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