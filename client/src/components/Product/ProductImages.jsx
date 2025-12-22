import { useState } from "react";
import { Share2, Heart, Maximize2, Minimize2 } from "lucide-react";
import ProductGallery from "@/components/Product/ProductGallery";
import { useSelector } from "react-redux";

const ProductImages = ({ images, selectedImage, onSelect, productName,onZoomChange,id }) => {

  const [isZoomed, setIsZoomed] = useState(false);

const isWishlisted = useSelector(
    (state) => state.wishlist.wishlistStatus[id]
  );
 
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: productName,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
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
        {/* Zoom button with working toggle */}
        <button
          onClick={toggleZoom}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
          aria-label={isZoomed ? "Minimize image" : "Zoom image"}
        >
          {isZoomed ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>

        {/* Product Gallery with zoom prop */}
        <ProductGallery
          images={images}
          selectedImage={selectedImage}
          onSelect={onSelect}
          isZoomed={isZoomed} // Pass zoom state
        />
        
        {/* Quick Actions */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setIsWishlisted(!isWishlisted)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isWishlisted
                ? "text-red-600 bg-red-50 dark:bg-red-900/20"
                : "text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
            <span className="text-sm font-medium">
              {isWishlisted ? "Wishlisted" : "Wishlist"}
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