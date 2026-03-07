import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Grid3x3,
} from "lucide-react";
import { useEffect, useState } from "react";

const MobileImageZoom = ({
  images,
  activeIndex,
  onClose,
  onPrev,
  onNext,
  onSelect,
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  // ✅ PREVENT BODY SCROLL
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.top = `-${window.scrollY}px`;

    return () => {
      const scrollY = document.body.style.top;
      document.body.style.overflow = "auto";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
    };
  }, []);

  useEffect(() => {
    // Reset scale and position when image changes
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [activeIndex]);

  const handleTouchStart = (e) => {
    // Agar button pe touch ho raha hai to ignore karo
    if (e.target.closest("button")) {
      return;
    }

    if (scale === 1) return;
    e.preventDefault();

    setIsDragging(true);
    const touch = e.touches[0];
    setStartPos({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    });
  };

  const handleTouchMove = (e) => {
    // Agar button pe touch ho raha hai to ignore karo
    if (e.target.closest("button")) {
      return;
    }

    if (!isDragging || scale === 1) return;
    e.preventDefault();

    const touch = e.touches[0];
    const newX = touch.clientX - startPos.x;
    const newY = touch.clientY - startPos.y;

    setPosition({ x: newX, y: newY });
  };

  const handleTouchEnd = (e) => {
    // Agar button pe touch ho raha hai to ignore karo
    if (e.target.closest("button")) {
      return;
    }

    e.preventDefault();
    setIsDragging(false);
  };

  // ✅ PINCH ZOOM HANDLER
  let initialDistance = 0;
  let initialScale = 1;

  const handlePinchStart = (e) => {
    // Agar button pe touch ho raha hai to ignore karo
    if (e.target.closest("button")) {
      return;
    }

    if (e.touches.length === 2) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      initialDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY,
      );
      initialScale = scale;
    }
  };

  const handlePinchMove = (e) => {
    // Agar button pe touch ho raha hai to ignore karo
    if (e.target.closest("button")) {
      return;
    }

    if (e.touches.length === 2) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY,
      );

      const newScale = initialScale * (currentDistance / initialDistance);
      setScale(Math.min(Math.max(newScale, 1), 3));
    }
  };

  const zoomIn = () => {
    setScale(Math.min(scale + 0.5, 3));
  };

  const zoomOut = () => {
    if (scale > 1) {
      setScale(Math.max(scale - 0.5, 1));
      setPosition({ x: 0, y: 0 });
    }
  };

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // ✅ CLOSE HANDLER
  const handleClose = () => {
    resetZoom();
    onClose();
  };

  if (!images?.length) return null;

  return (
    <div
      className="fixed inset-0 bg-black z-50"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* ✅ HEADER WITH HIGH Z-INDEX - ALWAYS ON TOP */}
      <div className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between p-4 bg-gradient-to-b from-black/90 via-black/70 to-transparent">
        <div className="flex items-center gap-3">
          <div className="text-white text-sm font-medium px-3 py-1.5 bg-black/50 rounded-full">
            {activeIndex + 1} / {images.length}
          </div>

          {/* ZOOM LEVEL INDICATOR */}
          {scale > 1 && (
            <div className="text-white text-sm px-3 py-1.5 bg-orange-500/90 rounded-full flex items-center gap-1">
              <ZoomIn size={14} />
              {scale.toFixed(1)}x
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={zoomOut}
            disabled={scale <= 1}
            className={`p-3 rounded-full ${
              scale <= 1
                ? "bg-gray-800/50 text-gray-500 cursor-not-allowed"
                : "bg-black/60 text-white hover:bg-black/80 active:bg-black/90"
            } transition-colors`}
            aria-label="Zoom out"
          >
            <ZoomOut size={20} />
          </button>
          <button
            onClick={zoomIn}
            disabled={scale >= 3}
            className={`p-3 rounded-full ${
              scale >= 3
                ? "bg-gray-800/50 text-gray-500 cursor-not-allowed"
                : "bg-black/60 text-white hover:bg-black/80 active:bg-black/90"
            } transition-colors`}
            aria-label="Zoom in"
          >
            <ZoomIn size={20} />
          </button>
          {/* ✅ CLOSE BUTTON - BRIGHT RED */}
          <button
            onClick={handleClose}
            className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700 active:bg-red-800 transition-colors shadow-lg border-2 border-white/30"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* IMAGE CONTAINER */}
      <div className="h-screen w-full flex items-center justify-center overflow-hidden">
        <div
          className="relative"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging
              ? "none"
              : "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            cursor: scale > 1 ? "grab" : "default",
          }}
        >
          <img
            src={images[activeIndex]?.url}
            alt="Zoomed product view"
            className="max-w-[90vw] max-h-[80vh] object-contain select-none"
            draggable="false"
          />
        </div>

        {/* ZOOM HINTS - WITH Z-INDEX */}
        {scale === 1 ? (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-4 py-2 rounded-full backdrop-blur-sm flex items-center gap-2 whitespace-nowrap z-40">
            <Grid3x3 size={14} />
            Pinch to zoom • Drag to pan
          </div>
        ) : (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-4 py-2 rounded-full backdrop-blur-sm z-40">
            Drag to pan • Pinch to zoom
          </div>
        )}

        {/* BOTTOM CLOSE BUTTON */}
        {/* CLOSE BUTTON - THODA NECHE */}
        <div className="fixed top-20 right-4 z-[100]">
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-red-600 transition-all duration-300 flex items-center justify-center shadow-lg border border-white/20 hover:scale-110 active:scale-95"
            aria-label="Close gallery"
          >
            <X size={20} />
          </button>
        </div>
        {/* NAVIGATION ARROWS - WITH Z-INDEX */}
        {images.length > 1 && scale === 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                resetZoom();
                onPrev();
              }}
              className="fixed left-2 top-1/2 -translate-y-1/2 p-4 rounded-full bg-black/60 text-white hover:bg-black/80 active:bg-black/90 transition-colors shadow-xl z-40"
              aria-label="Previous image"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                resetZoom();
                onNext();
              }}
              className="fixed right-2 top-1/2 -translate-y-1/2 p-4 rounded-full bg-black/60 text-white hover:bg-black/80 active:bg-black/90 transition-colors shadow-xl z-40"
              aria-label="Next image"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>

      {/* THUMBNAILS BAR - WITH Z-INDEX - FIXED HEIGHT */}
      {images.length > 1 && scale === 1 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 p-3 bg-gradient-to-t from-black/95 via-black/80 to-transparent">
          <div className="mb-1 px-2">
            <div className="text-white/80 text-xs font-medium">All Photos</div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => {
                  onSelect(i);
                  resetZoom();
                }}
                className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  i === activeIndex
                    ? "border-orange-500 scale-105"
                    : "border-white/20 hover:border-white/40"
                }`}
              >
                <img
                  src={img.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileImageZoom;
