import { useState } from "react";
import { Share2, Heart, Maximize2, Minimize2 } from "lucide-react";
import ProductGallery from "@/components/Product/ProductGallery";
import { useDispatch, useSelector } from "react-redux";
import { optimisticToggle, revertOptimisticToggle, toggleWishlist } from "@/redux/slices/wishlistSlice";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const ProductImages = ({
  images,
  selectedImage,
  onSelect,
  productName,
  onZoomChange,
  id,
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  
  const dispatch = useDispatch();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { isAuthenticated } = useSelector((state) => state.auth);
  const isWishlisted = useSelector((state) => state.wishlist.wishlistStatus[id]);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast({
        title: "Please login first",
        description: "Login to add items to wishlist",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (isToggling) return;

    setIsToggling(true);
    dispatch(optimisticToggle(id));

    try {
      const result = await dispatch(toggleWishlist(id)).unwrap();

      toast({
        title: result.action === "added"
          ? "Added to wishlist ❤️"
          : "Removed from wishlist",
        variant: "default",
      });
    } catch (error) {
      dispatch(revertOptimisticToggle(id));
      toast({
        title: "Failed to update wishlist",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsToggling(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: productName,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied to clipboard!",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  return (
    <div className="space-y-4">
      <div className="sticky top-6">
        {/* Zoom button */}
        <button
          onClick={toggleZoom}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
          aria-label={isZoomed ? "Minimize image" : "Zoom image"}
        >
          {isZoomed ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>

        {/* Product Gallery */}
        <ProductGallery
          images={images}
          selectedImage={selectedImage}
          onSelect={onSelect}
          isZoomed={isZoomed}
          setIsZoomed={setIsZoomed}
        />

        {/* Quick Actions */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleWishlistToggle}
            disabled={isToggling}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isWishlisted
                ? "text-red-600 bg-red-50 dark:bg-red-900/20"
                : "text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            } ${isToggling ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isToggling ? (
              <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
            )}
            <span className="text-sm font-medium">
              {isToggling ? "Updating..." : (isWishlisted ? "Wishlisted" : "Wishlist")}
            </span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Share2 size={20} />
            <span className="text-sm font-medium">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductImages;