import React, { useState, useEffect, memo } from "react";
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
import useCartActions from "@/hooks/useCartActions";

const ProductCard = ({
  _id,
  name = "Product Title",
  price = 0,
  rating = 0,
  reviewCount = 0,
  image = null,
  images = [],
  isOfferActive = false,
  discountedPrice = 0,
  discount = 0,
  variants = [],
  stock = 0,
  isFeatured = false,
  isBestSeller = false,
  slug,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const isWishlisted = useSelector((state) =>
    Boolean(state.wishlist.wishlistStatus[_id])
  );

  const { addToCart: addToCartHandler } = useCartActions();

  const displayImage = getImageUrl({ image, images, variants });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const imageSrc = imageError
    ? getImageUrl({ image, images, variants, imageError: true })
    : displayImage;

  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
  }, [displayImage]);

  useEffect(() => {
    const probe = new Image();
    probe.src = imageSrc;
    if (probe.complete) setImageLoaded(true);
  }, [imageSrc]);

  const finalPrice =
    isOfferActive && discountedPrice > 0 ? discountedPrice : price;

  const savings = price - finalPrice;
  const discountPercentage = isOfferActive && discount > 0 ? discount : 0;
  const stockStatus = getStockStatus(stock);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setIsAdding(true);

    try {
      const firstVariant = variants?.[0];
      const color = firstVariant?.color || "Default";
      const size = firstVariant?.size || "M";
      const variantId = firstVariant?._id;

      const productData = {
        _id,
        name,
        price: finalPrice,
        images: [{ url: displayImage }],
        variants: variants,
      };

      await addToCartHandler({
        productId: _id,
        productData,
        quantity: 1,
        color,
        size,
        variantId,
      });

      toast({
        title: "Added to cart",
        description: `${name} added to cart successfully`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Add to cart error:", error);
      toast({
        title: "Failed to add to cart",
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
            ? "Added to wishlist"
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

  const productLink = slug ? `/product/${slug}` : `/product/${_id}`;

  return (
    <article className="group relative h-full flex flex-col bg-card rounded-xl border border-border/80 shadow-sm hover:shadow-md hover:border-primary/25 transition-all duration-300 overflow-hidden">
      <Link to={productLink} className="flex flex-col flex-1 min-h-0">
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          {!imageLoaded && (
            <div
              className="absolute inset-0 z-10 bg-muted animate-pulse"
              aria-hidden
            />
          )}

          <img
            key={imageSrc}
            loading="lazy"
            decoding="async"
            src={imageSrc}
            alt={name}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              if (!imageError) setImageError(true);
              else setImageLoaded(true);
            }}
            className="block w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]"
          />

          {/* Badges on image */}
          <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
            {discountPercentage > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-red-500 text-white text-[10px] font-bold shadow-sm">
                {discountPercentage}% OFF
              </span>
            )}
            {isFeatured && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md brand-gradient-bg text-primary-foreground text-[10px] font-bold shadow-sm">
                <Sparkles size={9} />
                Featured
              </span>
            )}
            {isBestSeller && !isFeatured && (
              <span className="px-2 py-0.5 rounded-md brand-gradient-bg text-primary-foreground text-[10px] font-bold shadow-sm">
                Bestseller
              </span>
            )}
          </div>

          {stock <= 0 && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/45 backdrop-blur-[1px]">
              <span className="px-3 py-1 rounded-full bg-white/95 text-xs font-semibold text-gray-800">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col p-2.5 gap-1">
          <h3 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors" title={name}>
            {name}
          </h3>

          <div className="flex items-center gap-1.5 min-h-[22px]">
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[11px] font-semibold shrink-0">
              <Star size={10} className="fill-white shrink-0" />
              {rating.toFixed(1)}
            </span>
            {reviewCount > 0 && (
              <span className="text-[11px] text-muted-foreground shrink-0">
                ({reviewCount})
              </span>
            )}
            {stock > 0 && stock <= 5 && (
              <span className={`text-[10px] font-medium truncate ml-auto ${stockStatus.color}`}>
                {stockStatus.text}
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-base font-bold text-foreground">
              {formatPrice(finalPrice)}
            </span>
            {discountedPrice > 0 && price > discountedPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(price)}
              </span>
            )}
            {savings > 0 && (
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                Save {formatPrice(savings)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Wishlist — on image corner */}
      <button
        type="button"
        onClick={handleWishlistToggle}
        className="absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full bg-white/95 dark:bg-gray-900/95 shadow-md flex items-center justify-center hover:scale-110 transition-transform"
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        disabled={isToggling}
      >
        <Heart
          size={16}
          className={`transition-colors ${
            isWishlisted
              ? "fill-red-500 text-red-500"
              : "text-gray-500 hover:text-red-500"
          } ${isToggling ? "opacity-50" : ""}`}
        />
      </button>

      <div className="px-2.5 pb-2.5 pt-0">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isAdding || stock <= 0}
          className={`w-full py-2 rounded-lg font-medium text-xs transition-all duration-200 flex items-center justify-center gap-1.5 ${
            stock <= 0
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : isAdding
                ? "bg-primary/15 text-primary cursor-wait"
                : "brand-gradient-bg text-primary-foreground shadow-sm hover:opacity-95 active:scale-[0.98]"
          }`}
        >
          {isAdding ? (
            <>
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Adding...
            </>
          ) : stock <= 0 ? (
            "Out of Stock"
          ) : (
            <>
              <ShoppingBag size={15} />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </article>
  );
};

export default memo(ProductCard);
