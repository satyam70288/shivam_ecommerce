import { X } from "lucide-react";

const MobileImageZoom = ({ images, activeIndex, onClose }) => {
  if (!images?.length) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black lg:hidden">
      {/* Header */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-black/60 text-white"
          aria-label="Close zoom"
        >
          <X size={22} />
        </button>
      </div>

      {/* Image */}
      <div className="w-full h-full flex items-center justify-center overflow-auto">
        <img
          src={images[activeIndex]?.url}
          alt="zoomed product"
          className="
            max-w-full
            max-h-full
            object-contain
            select-none
            touch-manipulation
          "
        />
      </div>
    </div>
  );
};

export default MobileImageZoom;
