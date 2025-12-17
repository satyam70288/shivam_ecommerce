import { useState } from "react";
import MobileImageZoom from "./MobileImageZoom";

const ProductGallery = ({
  images = [],
  selectedImage = 0,
  onSelect,
  isZoomed
}) => {
  const [isMobileZoomOpen, setIsMobileZoomOpen] = useState(false);
  const [showZoom, setShowZoom] = useState(false);
  const [bgPos, setBgPos] = useState("50% 50%");

  const activeImage = images[selectedImage]?.url;
  if (!activeImage) return null;

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setBgPos(`${x}% ${y}%`);
  };

  return (
    <>
      <div className="flex gap-4">
        {/* THUMBNAILS — FIXED WIDTH */}
        {images.length > 1 && (
          <div className="flex flex-col gap-2 shrink-0">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => onSelect(i)}
                className={`w-14 h-14 rounded-md border
                  ${
                    selectedImage === i
                      ? "border-orange-500"
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

        {/* IMAGE CONTAINER — WIDTH CHANGES SAFELY */}
        <div
  className={`
    relative
    hidden lg:block
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
  onMouseLeave={() => setShowZoom(false)}
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


        {/* MOBILE IMAGE */}
        <div
          className="
            lg:hidden
            w-full
            h-[320px] sm:h-[360px]
            rounded-xl
            border
            bg-gray-100 dark:bg-neutral-900
            flex items-center justify-center
          "
          onClick={() => setIsMobileZoomOpen(true)}
        >
          <img
            src={activeImage}
            alt="product"
            className="max-h-full w-auto object-contain"
          />
        </div>
      </div>

      {/* MOBILE FULLSCREEN */}
      {isMobileZoomOpen && (
        <MobileImageZoom
          images={images}
          activeIndex={selectedImage}
          onClose={() => setIsMobileZoomOpen(false)}
        />
      )}
    </>
  );
};

export default ProductGallery;
