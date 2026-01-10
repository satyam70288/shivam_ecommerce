import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBanners } from "@/redux/slices/bannerSlice";


const HeaderDisplay = () => {
  const [index, setIndex] = useState(0);
  const timeoutRef = useRef(null);
  
  // Redux hooks add karein
  const dispatch = useDispatch();
  const { banners, loading, error } = useSelector((state) => state.banner);

  // Fetch banners on component mount
  useEffect(() => {
    dispatch(fetchBanners());
  }, [dispatch]);

  // Auto slide - sirf tab jab banners available hain
  useEffect(() => {
    if (banners && banners.length > 0) {
      timeoutRef.current = setInterval(() => {
        setIndex((i) => (i + 1) % banners.length);
      }, 5000);
      
      return () => clearInterval(timeoutRef.current);
    }
  }, [banners]);

  const next = () => {
    if (banners && banners.length > 0) {
      setIndex((i) => (i + 1) % banners.length);
    }
  };

  const prev = () => {
    if (banners && banners.length > 0) {
      setIndex((i) => (i === 0 ? banners.length - 1 : i - 1));
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full">
        <div className="relative h-[400px] md:h-[500px] overflow-hidden rounded-xl md:rounded-2xl bg-gray-200 animate-pulse"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full">
        <div className="relative h-[400px] md:h-[500px] overflow-hidden rounded-xl md:rounded-2xl bg-red-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-2">Failed to load banners</p>
            <button 
              onClick={() => dispatch(fetchBanners())}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No banners available
  if (!banners || banners.length === 0) {
    return (
      <div className="w-full">
        <div className="relative h-[400px] md:h-[500px] overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No Banners Available</h2>
            <p className="text-gray-600">Check back later for amazing offers!</p>
          </div>
        </div>
      </div>
    );
  }

  // Safe access to current slide
  const currentSlide = banners[index] || banners[0];

  // Agar currentSlide undefined ho to first banner use karo
  if (!currentSlide) {
    return null; // Ya fallback UI
  }

  return (
    <div className="w-full">
<div className="relative h-[260px] sm:h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden rounded-xl md:rounded-2xl">
  {/* 
    Mobile: 260px
    Small tablets: 300px
    Tablets: 400px
    Desktop: 500px
  */}
    {/* Background Image */}
        <img
          src={currentSlide.image}
          alt={currentSlide.title || "Banner"}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

        {/* Content */}
        <div className="relative h-full flex items-center px-6 md:px-12 lg:px-20">
          <div className="max-w-xl">
            {/* Tag - Optional, agar nahi chahiye to remove kar do */}
            {currentSlide.tag && (
              <div className="mb-4">
                <span className="inline-block px-4 py-2 bg-white text-gray-900 text-sm font-semibold rounded-full">
                  {currentSlide.tag}
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
              {currentSlide.title}
            </h1>

            {/* Subtitle */}
            {currentSlide.subtitle && (
              <p className="text-lg md:text-xl text-gray-200 mb-8">
                {currentSlide.subtitle}
              </p>
            )}

            {/* CTA Button */}
            <button 
              className="px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-300"
              onClick={() => window.location.href = currentSlide.link || '#'}
            >
              Shop Now →
            </button>
          </div>
        </div>

        {/* Navigation Arrows - Hidden on mobile */}
        {banners.length > 1 && (
          <>
            <button
              onClick={prev}
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              onClick={next}
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Dots - Only show if more than 1 banner */}
        {banners.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === index ? "bg-white w-6" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HeaderDisplay;