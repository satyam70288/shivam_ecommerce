import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

/**
 * Full-screen image viewer — portaled to body so it covers the whole page on desktop.
 */
export default function ImageLightbox({
  images = [],
  activeIndex = 0,
  onClose,
  onPrev,
  onNext,
  onSelect,
}) {
  const [scale, setScale] = useState(1);
  const isDesktop =
    typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches;

  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && images.length > 1) onPrev();
      if (e.key === "ArrowRight" && images.length > 1) onNext();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.scrollTo(0, scrollY);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, onPrev, onNext, images.length]);

  useEffect(() => {
    setScale(1);
  }, [activeIndex]);

  if (!images?.length) return null;

  const content = (
    <div
      className="fixed inset-0 z-[9999] bg-black/95 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Product image viewer"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <span className="text-white/90 text-sm font-medium px-3 py-1 rounded-full bg-white/10">
          {activeIndex + 1} / {images.length}
        </span>
        <div className="flex items-center gap-2">
          {isDesktop && (
            <>
              <button
                type="button"
                onClick={() => setScale((s) => Math.max(1, s - 0.5))}
                disabled={scale <= 1}
                className="p-2 rounded-full bg-white/10 text-white disabled:opacity-40 hover:bg-white/20"
                aria-label="Zoom out"
              >
                <ZoomOut size={20} />
              </button>
              <button
                type="button"
                onClick={() => setScale((s) => Math.min(3, s + 0.5))}
                disabled={scale >= 3}
                className="p-2 rounded-full bg-white/10 text-white disabled:opacity-40 hover:bg-white/20"
                aria-label="Zoom in"
              >
                <ZoomIn size={20} />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white text-black hover:bg-gray-200"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      {/* Main image */}
      <div className="flex-1 flex items-center justify-center relative min-h-0 px-4">
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              className="absolute left-2 md:left-6 z-10 p-3 rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Previous image"
            >
              <ChevronLeft size={28} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              className="absolute right-2 md:right-6 z-10 p-3 rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Next image"
            >
              <ChevronRight size={28} />
            </button>
          </>
        )}

        <img
          src={images[activeIndex]?.url}
          alt="Product enlarged view"
          className="max-w-full max-h-[calc(100vh-140px)] object-contain select-none transition-transform duration-200"
          style={{ transform: `scale(${scale})` }}
          draggable={false}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="shrink-0 px-4 pb-4 pt-2">
          <div className="flex gap-2 justify-center overflow-x-auto max-w-3xl mx-auto">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSelect(i)}
                className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                  i === activeIndex
                    ? "border-primary scale-105"
                    : "border-white/30 opacity-70 hover:opacity-100"
                }`}
              >
                <img src={img.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {!isDesktop && scale === 1 && (
        <p className="text-center text-white/50 text-xs pb-3">
          Pinch to zoom on mobile · Swipe thumbnails to change photo
        </p>
      )}
    </div>
  );

  return createPortal(content, document.body);
}
