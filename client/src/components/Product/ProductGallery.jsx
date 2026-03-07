import { useState, useEffect } from "react";
import MobileImageZoom from "./MobileImageZoom";

const ProductGallery = ({
  images = [],
  selectedImage = 0,
  onSelect,
  isZoomed,
  setIsZoomed,
  onMobileZoomChange,  // ✅ Parent ko batane ke liye
  onZoomStateChange     // ✅ NEW - Buttons hide karne ke liye
}) => {
  const [isMobileZoomOpen, setIsMobileZoomOpen] = useState(false); // ✅ false se initialize karo
  const [showZoom, setShowZoom] = useState(false);
  const [bgPos, setBgPos] = useState("50% 50%");

  const activeImage = images[selectedImage]?.url;
  
  // Agar image nahi hai to return
  if (!activeImage) return null;

  const handleMouseMove = (e) => {
    if (!isZoomed && !showZoom) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setBgPos(`${x}% ${y}%`);
  };

  // ✅ Mobile Zoom Open Handler
  const handleMobileZoomOpen = () => {
    setIsMobileZoomOpen(true);
    if (onMobileZoomChange) onMobileZoomChange(true);
    if (onZoomStateChange) onZoomStateChange(true); // ✅ Parent ko bataye ki zoom open hai
  };

  // ✅ Mobile Zoom Close Handler
  const handleMobileZoomClose = () => {
    setIsMobileZoomOpen(false);
    setIsZoomed(false);
    setShowZoom(false);
    if (onMobileZoomChange) onMobileZoomChange(false);
    if (onZoomStateChange) onZoomStateChange(false); // ✅ Parent ko bataye ki zoom close hai
  };

  // ✅ Keyboard events handle karo
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && (isZoomed || isMobileZoomOpen)) {
        handleMobileZoomClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZoomed, isMobileZoomOpen]);

  return (
    <>
      {/* DESKTOP VIEW */}
      <div className="hidden lg:flex gap-4">
        {/* THUMBNAILS */}
        {images.length > 1 && (
          <div className="flex flex-col gap-2 shrink-0">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => {
                  onSelect(i);
                  if (isZoomed) setIsZoomed(false);
                  setShowZoom(false);
                }}
                className={`w-14 h-14 rounded-md border transition-all
                  ${
                    selectedImage === i
                      ? "border-orange-500 border-2 scale-105"
                      : "border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/30"
                  }`}
              >
                <img
                  src={img.url}
                  alt=""
                  className="h-full w-full object-contain"
                />
              </button>
            ))}
          </div>
        )}

        {/* MAIN IMAGE CONTAINER */}
        <div
          className={`
            relative
            h-[400px]
            rounded-xl
            border
            bg-gray-100 dark:bg-neutral-900
            overflow-hidden
            cursor-crosshair
            transition-all duration-300
            ${isZoomed ? "w-[520px]" : "w-[400px]"}
          `}
          onMouseEnter={() => setShowZoom(true)}
          onMouseLeave={() => {
            if (!isZoomed) {
              setShowZoom(false);
            }
          }}
          onMouseMove={handleMouseMove}
        >
          {!showZoom && (
            <img
              src={activeImage}
              alt="product"
              className={`
                h-full w-full object-contain
                transition-transform duration-300
                ${isZoomed ? "scale-110" : "scale-100"}
              `}
            />
          )}

          {showZoom && (
            <div
              className="absolute inset-0 bg-no-repeat"
              style={{
                backgroundImage: `url(${activeImage})`,
                backgroundSize: isZoomed ? "260%" : "200%",
                backgroundPosition: bgPos,
              }}
            />
          )}
        </div>
      </div>

      {/* MOBILE VIEW */}
      <div className="lg:hidden">
        {/* MAIN IMAGE */}
        <div
          className="
            w-full
            h-[320px] sm:h-[360px]
            rounded-xl
            border
            bg-gray-100 dark:bg-neutral-900
            flex items-center justify-center
            mb-4
            relative
            cursor-pointer
          "
          onClick={handleMobileZoomOpen} // ✅ Updated handler
        >
          <img
            src={activeImage}
            alt="product"
            className="max-h-full w-auto object-contain"
          />

          {/* TAP TO ZOOM HINT */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/70 text-white text-sm rounded-full backdrop-blur-sm pointer-events-none">
            Tap to zoom
          </div>
        </div>

        {/* THUMBNAILS BELOW */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => {
                  onSelect(i);
                  setShowZoom(false);
                }}
                className={`shrink-0 w-16 h-16 rounded-md border transition-all
                  ${
                    selectedImage === i
                      ? "border-orange-500 border-2"
                      : "border-gray-300 dark:border-white/10"
                  }`}
              >
                <img
                  src={img.url}
                  alt=""
                  className="h-full w-full object-contain"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* MOBILE FULLSCREEN */}
      {(isMobileZoomOpen || isZoomed) && (
        <MobileImageZoom
          images={images}
          activeIndex={selectedImage}
          onClose={handleMobileZoomClose} // ✅ Updated handler
          onPrev={() => {
            const newIndex = (selectedImage - 1 + images.length) % images.length;
            onSelect(newIndex);
          }}
          onNext={() => {
            const newIndex = (selectedImage + 1) % images.length;
            onSelect(newIndex);
          }}
          onSelect={(index) => {
            onSelect(index);
            handleMobileZoomClose();
          }}
        />
      )}
    </>
  );
};

export default ProductGallery;