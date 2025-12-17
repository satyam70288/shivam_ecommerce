import { useState } from "react";

const ProductImageMagnifier = ({ src }) => {
  const [showZoom, setShowZoom] = useState(false);
  const [bgPos, setBgPos] = useState("50% 50%");

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setBgPos(`${x}% ${y}%`);
  };

  return (
    <div className="hidden lg:flex gap-4">
      {/* MAIN IMAGE */}
      <div
        onMouseEnter={() => setShowZoom(true)}
        onMouseLeave={() => setShowZoom(false)}
        onMouseMove={handleMouseMove}
        className="
          w-[400px] h-[400px]
          border border-gray-200 dark:border-white/10
          rounded-xl
          bg-gray-100 dark:bg-neutral-900
          flex items-center justify-center
          cursor-crosshair
          overflow-hidden
        "
      >
        <img
          src={src}
          alt="product"
          className="max-h-full object-contain pointer-events-none"
        />
      </div>

      {/* ZOOM PREVIEW */}
      {showZoom && (
        <div
          className="
            w-[400px] h-[400px]
            border border-gray-200 dark:border-white/10
            rounded-xl
            bg-no-repeat
          "
          style={{
            backgroundImage: `url(${src})`,
            backgroundPosition: bgPos,
            backgroundSize: "200%",
          }}
        />
      )}
    </div>
  );
};

export default ProductImageMagnifier;
