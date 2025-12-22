import React, { useState } from "react";
import { starsGenerator } from "@/constants/helper";
import { toast } from "@/hooks/use-toast";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import useCartActions from "@/hooks/useCartActions";
import { Heart, ShoppingBag, Star, Sparkles, TrendingUp } from "lucide-react";

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
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { addToCart } = useCartActions();

  const [wishlisted, setWishlisted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [imageError, setImageError] = useState(false);

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted(!wishlisted);

    toast({
      title: !wishlisted ? "Added to Wishlist ❤️" : "Removed from Wishlist",
    });
  };

  // Optimize image with Cloudinary transformations
  const optimizeImg = (url) => {
    if (!url) return null;
    return url.replace("/upload/", "/upload/f_auto,q_auto,w_600/");
  };

  // Get image URL with fallback
  const getImageUrl = () => {
    if (imageError) {
      return "https://images.pexels.com/photos/3801990/pexels-photo-3801990.jpeg";
    }
    if (image?.url) return image.url;
    if (variants[0]?.images?.[0]?.url) return variants[0].images[0].url;
    return "https://images.pexels.com/photos/3801990/pexels-photo-3801990.jpeg";
  };

  const displayImage = optimizeImg(getImageUrl());

  // Check if offer is active
  const now = new Date();
  const isOfferActive =
    discount > 0 && (!offerValidTill || new Date(offerValidTill) >= now);

  // Calculate prices
  const finalPrice = isOfferActive && discountedPrice > 0 ? discountedPrice : price;
  const savings = price - finalPrice;
  const discountPercentage = discount || (savings > 0 ? Math.round((savings / price) * 100) : 0);

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

  // Stock status with better styling
  const getStockStatus = () => {
    if (stock <= 0) return { 
      text: "Out of Stock", 
      color: "text-red-600 dark:text-red-300", 
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border border-red-200 dark:border-red-800"
    };
    if (stock <= 5) return { 
      text: `Only ${stock} left`, 
      color: "text-amber-600 dark:text-amber-300", 
      bg: "bg-amber-50 dark:bg-amber-900/20",
      border: "border border-amber-200 dark:border-amber-800"
    };
    return { 
      text: "In Stock", 
      color: "text-emerald-600 dark:text-emerald-300", 
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      border: "border border-emerald-200 dark:border-emerald-800"
    };
  };

  const stockStatus = getStockStatus();

  // Format price nicely
  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('₹', '₹');
  };

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
            onClick={toggleWishlist}
            className="w-8 h-8 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 hover:scale-110 group/wishlist"
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              size={16}
              className={`transition-all duration-300 ${
                wishlisted
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
              
              {/* Quick add to cart overlay */}
              {/* <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-end justify-center">
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding || stock <= 0}
                  className="mb-4 px-6 py-2 rounded-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm text-gray-900 dark:text-white font-semibold text-sm shadow-xl transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAdding ? "Adding..." : "Quick Add"}
                </button>
              </div> */}
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
                  {reviewCount.toLocaleString()} {reviewCount === 1 ? 'Review' : 'Reviews'}
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
            <div className={`text-xs font-medium px-3 py-1.5 rounded-lg inline-flex items-center gap-2 ${stockStatus.bg} ${stockStatus.color} ${stockStatus.border}`}>
              <div className={`w-2 h-2 rounded-full ${stock <= 0 ? 'bg-red-500' : stock <= 5 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <span>{stockStatus.text}</span>
            </div>

            {/* COLOR VARIANTS - BETTER STYLING */}
            {variants.length > 0 && variants[0].color && (
              <div className="space-y-2">
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  Available in {variants.length} {variants.length === 1 ? 'color' : 'colors'}
                </div>
                <div className="flex gap-2">
                  {variants.slice(0, 4).map((variant, index) => (
                    <div
                      key={index}
                      className="relative w-7 h-7 rounded-full border-2 border-gray-300 dark:border-gray-600 hover:border-emerald-500 dark:hover:border-emerald-400 cursor-pointer transition-all duration-300 hover:scale-110 group/color"
                      style={{ backgroundColor: variant.color || '#ccc' }}
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