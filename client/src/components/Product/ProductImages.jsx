import { useState } from "react";
import { Share2, Heart, Maximize2 } from "lucide-react";
import ProductGallery from "@/components/Product/ProductGallery";
import { useDispatch, useSelector } from "react-redux";
import {
  optimisticToggle,
  revertOptimisticToggle,
  toggleWishlist,
} from "@/redux/slices/wishlistSlice";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const ProductImages = ({
  images,
  selectedImage,
  onSelect,
  productName,
  id,
  onMobileZoomChange,
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const dispatch = useDispatch();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { isAuthenticated } = useSelector((state) => state.auth);
  const isWishlisted = useSelector((state) =>
    Boolean(state.wishlist.wishlistStatus[id])
  );

  const handleLightboxChange = (open) => {
    setLightboxOpen(open);
    onMobileZoomChange?.(open);
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
      navigate("/login");
      return;
    }

    if (isToggling) return;

    setIsToggling(true);
    dispatch(optimisticToggle(id));

    try {
      const result = await dispatch(toggleWishlist(id)).unwrap();
      toast({
        title:
          result.action === "added"
            ? "Added to wishlist ❤️"
            : "Removed from wishlist",
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
        toast({ title: "Link copied to clipboard!" });
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const openLightbox = () => {
    handleLightboxChange(true);
  };

  return (
    <div className="space-y-4">
      <div className="sticky top-6">
        <button
          type="button"
          onClick={openLightbox}
          className="absolute top-4 right-4 z-10 p-2 bg-card/95 backdrop-blur-sm rounded-lg shadow-lg border border-border hover:bg-muted transition-colors"
          aria-label="Enlarge image"
        >
          <Maximize2 size={20} />
        </button>

        <ProductGallery
          images={images}
          selectedImage={selectedImage}
          onSelect={onSelect}
          lightboxOpen={lightboxOpen}
          setLightboxOpen={setLightboxOpen}
          onLightboxChange={handleLightboxChange}
        />

        <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
          <button
            type="button"
            onClick={handleWishlistToggle}
            disabled={isToggling}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isWishlisted
                ? "text-red-600 bg-red-50 dark:bg-red-900/20"
                : "text-muted-foreground hover:text-red-600 hover:bg-muted"
            } ${isToggling ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isToggling ? (
              <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
            )}
            <span className="text-sm font-medium">
              {isToggling
                ? "Updating..."
                : isWishlisted
                  ? "Wishlisted"
                  : "Wishlist"}
            </span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
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
