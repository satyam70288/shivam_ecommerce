import { useState } from "react";
import ImageLightbox from "./ImageLightbox";

const ProductGallery = ({
  images = [],
  selectedImage = 0,
  onSelect,
  lightboxOpen = false,
  setLightboxOpen,
  onLightboxChange,
}) => {
  const [showZoom, setShowZoom] = useState(false);
  const [bgPos, setBgPos] = useState("50% 50%");

  const activeImage = images[selectedImage]?.url;
  if (!activeImage) return null;

  const openLightbox = () => {
    setLightboxOpen?.(true);
    onLightboxChange?.(true);
  };

  const closeLightbox = () => {
    setLightboxOpen?.(false);
    onLightboxChange?.(false);
    setShowZoom(false);
  };

  const handleMouseMove = (e) => {
    if (!showZoom) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setBgPos(`${x}% ${y}%`);
  };

  return (
    <>
      {/* DESKTOP */}
      <div className="hidden lg:flex gap-4">
        {images.length > 1 && (
          <div className="flex flex-col gap-2 shrink-0">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  onSelect(i);
                  setShowZoom(false);
                }}
                className={`w-14 h-14 rounded-md border transition-all ${
                  selectedImage === i
                    ? "border-primary border-2 scale-105"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <img src={img.url} alt="" className="h-full w-full object-contain" />
              </button>
            ))}
          </div>
        )}

        <div
          className="relative h-[400px] w-[400px] rounded-xl border border-border bg-muted overflow-hidden cursor-zoom-in"
          onMouseEnter={() => setShowZoom(true)}
          onMouseLeave={() => setShowZoom(false)}
          onMouseMove={handleMouseMove}
          onClick={openLightbox}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openLightbox();
            }
          }}
          aria-label="View larger image"
        >
          {!showZoom && (
            <img
              src={activeImage}
              alt="product"
              className="h-full w-full object-contain"
            />
          )}
          {showZoom && (
            <div
              className="absolute inset-0 bg-no-repeat pointer-events-none"
              style={{
                backgroundImage: `url(${activeImage})`,
                backgroundSize: "200%",
                backgroundPosition: bgPos,
              }}
            />
          )}
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-white bg-black/60 px-3 py-1 rounded-full pointer-events-none">
            Click to enlarge
          </span>
        </div>
      </div>

      {/* MOBILE */}
      <div className="lg:hidden">
        <div
          className="w-full h-[320px] sm:h-[360px] rounded-xl border border-border bg-muted flex items-center justify-center mb-4 relative cursor-pointer"
          onClick={openLightbox}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openLightbox();
            }
          }}
          aria-label="Tap to view larger image"
        >
          <img
            src={activeImage}
            alt="product"
            className="max-h-full w-auto object-contain"
          />
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/70 text-white text-sm rounded-full pointer-events-none">
            Tap to enlarge
          </span>
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSelect(i)}
                className={`shrink-0 w-16 h-16 rounded-md border transition-all ${
                  selectedImage === i
                    ? "border-primary border-2"
                    : "border-border"
                }`}
              >
                <img src={img.url} alt="" className="h-full w-full object-contain" />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightboxOpen && (
        <ImageLightbox
          images={images}
          activeIndex={selectedImage}
          onClose={closeLightbox}
          onPrev={() => {
            onSelect((selectedImage - 1 + images.length) % images.length);
          }}
          onNext={() => {
            onSelect((selectedImage + 1) % images.length);
          }}
          onSelect={(index) => onSelect(index)}
        />
      )}
    </>
  );
};

export default ProductGallery;
