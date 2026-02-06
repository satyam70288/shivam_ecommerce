// components/Review/ReviewImage.jsx
import React, { useState } from "react";
import { ZoomIn, Loader, ChevronRight, ChevronLeft } from "lucide-react";

const ReviewImage = ({ reviewImages }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const hasImages = reviewImages && reviewImages.length > 0;
  
  if (!hasImages) return null;

  // Open single image in modal
  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  // Open gallery view
  const openGallery = (index = 0) => {
    setCurrentImageIndex(index);
    setShowImageModal(true);
  };

  // Navigation in modal
  const nextImage = () => {
    if (reviewImages.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % reviewImages.length);
    }
  };

  const prevImage = () => {
    if (reviewImages.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + reviewImages.length) % reviewImages.length);
    }
  };

  // Flipkart style - small thumbnails with +more indicator
  return (
    <>
      <div className="mb-4 md:mb-5">
        {/* Images Grid - Flipkart Style */}
        <div className="flex flex-wrap gap-2">
          {reviewImages.slice(0, 3).map((img, index) => (
            <div 
              key={index}
              className="relative group cursor-pointer"
              onClick={() => openGallery(index)}
            >
              {/* Small Thumbnail - Flipkart Size */}
              <div className="w-20 h-20 md:w-24 md:h-24 rounded border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-800">
                <img
                  src={img.url}
                  alt={`Review ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                />
              </div>
              
              {/* Hover Zoom Icon */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 rounded flex items-center justify-center opacity-0 group-hover:opacity-100">
                <ZoomIn className="h-5 w-5 text-white/80" />
              </div>
            </div>
          ))}
          
          {/* +More Indicator - Flipkart Style */}
          {reviewImages.length > 3 && (
            <div 
              className="relative group cursor-pointer"
              onClick={() => openGallery(3)}
            >
              <div className="w-20 h-20 md:w-24 md:h-24 rounded border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-lg md:text-xl font-bold text-gray-600 dark:text-gray-400">
                    +{reviewImages.length - 3}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    more
                  </div>
                </div>
              </div>
              
              {/* Hover Effect */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 rounded flex items-center justify-center opacity-0 group-hover:opacity-100">
                <ZoomIn className="h-5 w-5 text-white/80" />
              </div>
            </div>
          )}
        </div>
        
        {/* Image Count Text */}
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {reviewImages.length} photo{reviewImages.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Image Modal/Gallery - Flipkart Style */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4">
          <div className="relative w-full max-w-4xl">
            {/* Close Button */}
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-12 right-0 text-white p-2 hover:bg-white/10 rounded-full z-10"
            >
              <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center">
                <span className="text-xl">×</span>
              </div>
            </button>
            
            {/* Main Image */}
            <div className="relative">
              <img
                src={selectedImage || reviewImages[currentImageIndex]?.url}
                alt="Review"
                className="w-full max-h-[70vh] object-contain rounded-lg"
              />
              
              {/* Navigation Arrows */}
              {reviewImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
              
              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {reviewImages.length}
              </div>
            </div>
            
            {/* Thumbnail Strip */}
            {reviewImages.length > 1 && (
              <div className="flex justify-center gap-2 mt-4 overflow-x-auto pb-2">
                {reviewImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded overflow-hidden border-2 ${
                      index === currentImageIndex
                        ? "border-blue-500"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={`Thumb ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ReviewImage;