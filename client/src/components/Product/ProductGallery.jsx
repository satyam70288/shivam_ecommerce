import { useState } from "react";
import ImageLightbox from "./ImageLightbox";
import { ZoomIn } from "lucide-react";

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

  const mainFrameClass =
    "group relative w-full overflow-hidden rounded-xl border border-border bg-white dark:bg-zinc-950 shadow-sm cursor-zoom-in";

  const renderMainImage = (hintText) => (
    <>
      {!showZoom && (
        <img
          src={activeImage}
          alt="product"
          className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
          draggable={false}
        />
      )}
      {showZoom && (
        <div
          className="absolute inset-0 bg-no-repeat"
          style={{
            backgroundImage: `url(${activeImage})`,
            backgroundSize: "180%",
            backgroundPosition: bgPos,
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
      <span className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-xs text-white bg-black/65 backdrop-blur-sm px-3 py-1.5 rounded-full pointer-events-none">
        <ZoomIn size={14} />
        {hintText}
      </span>
    </>
  );

  return (
    <>
      {/* DESKTOP */}
      <div className="hidden lg:flex gap-3 w-full items-start">
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
                className={`w-[72px] h-[72px] rounded-lg border-2 overflow-hidden bg-white dark:bg-zinc-950 transition-all ${
                  selectedImage === i
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <img
                  src={img.url}
                  alt=""
                  className="h-full w-full object-cover object-center"
                />
              </button>
            ))}
          </div>
        )}

        <div
          className={`${mainFrameClass} flex-1 aspect-square max-h-[min(520px,50vw)]`}
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
          {renderMainImage("Click to enlarge")}
        </div>
      </div>

      {/* MOBILE */}
      <div className="lg:hidden w-full">
        <div
          className={`${mainFrameClass} aspect-[4/3] sm:aspect-square mb-3`}
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
          {renderMainImage("Tap to enlarge")}
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSelect(i)}
                className={`shrink-0 w-[68px] h-[68px] rounded-lg border-2 overflow-hidden bg-white dark:bg-zinc-950 ${
                  selectedImage === i
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border"
                }`}
              >
                <img
                  src={img.url}
                  alt=""
                  className="h-full w-full object-cover object-center"
                />
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
