import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star, Tag } from "lucide-react";

const sliderData = [
  {
    id: 1,
    title: "Toys Collection",
    subtitle: "Fun & Educational",
    items: "500+ Products",
    discount: "40% Off",
    image:
      "https://images.unsplash.com/photo-1599623560574-39d485900c95?w=1200&auto=format&fit=crop",
    categories: ["Toys", "Games", "Educational"],
    rating: 4.8,
    tag: "BEST SELLER",
  },
  {
    id: 2,
    title: "Gift Hampers",
    subtitle: "Perfect Presents",
    items: "300+ Options",
    discount: "Free Wrapping",
    image:
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1200&auto=format&fit=crop",
    categories: ["Gifts", "Occasion", "Anniversary"],
    rating: 4.7,
    tag: "POPULAR",
  },
  {
    id: 3,
    title: "Premium Stationery",
    subtitle: "Office & School",
    items: "200+ Items",
    discount: "School Sale",
    image:
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&auto=format&fit=crop",
    categories: ["Office", "School", "Books"],
    rating: 4.9,
    tag: "SALE",
  },
  {
    id: 4,
    title: "Beauty & Cosmetic",
    subtitle: "Makeup & Skincare",
    items: "400+ Brands",
    discount: "Buy 1 Get 1",
    image:
      "https://images.unsplash.com/photo-1591085686350-798c0f9faa7f?w=1200&auto=format&fit=crop",
    categories: ["Beauty", "Skincare", "Makeup"],
    rating: 4.6,
    tag: "NEW",
  },
  {
    id: 5,
    title: "Fashion Jewellery",
    subtitle: "Latest Designs",
    items: "1000+ Designs",
    discount: "From ₹99",
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&auto=format&fit=crop",
    categories: ["Jewellery", "Fashion", "Designs"],
    rating: 4.8,
    tag: "TRENDING",
  },
];

const HeaderDisplay = () => {
  const [index, setIndex] = useState(0);
  const timeoutRef = useRef(null);

  const next = () => setIndex((i) => (i + 1) % sliderData.length);
  const prev = () => setIndex((i) => (i === 0 ? sliderData.length - 1 : i - 1));

  useEffect(() => {
    timeoutRef.current = setInterval(next, 5000);
    return () => clearInterval(timeoutRef.current);
  }, []);

  const currentSlide = sliderData[index];

  return (
    <div className="w-full">
      <div className="relative h-[400px] md:h-[500px] overflow-hidden rounded-xl md:rounded-2xl">
        {/* Background Image */}
        <img
          src={currentSlide.image}
          alt={currentSlide.title}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />

        {/* Content */}
        <div className="relative h-full flex items-center px-6 md:px-12 lg:px-20">
          <div className="max-w-xl">
            {/* Tag */}
            <div className="mb-4">
              <span className="inline-block px-4 py-2 bg-white text-gray-900 text-sm font-semibold rounded-full">
                {currentSlide.tag}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
              {currentSlide.title}
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-200 mb-6">
              {currentSlide.subtitle}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-white" />
                <span className="text-white font-medium">
                  {currentSlide.items}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="text-white font-medium">
                  {currentSlide.rating}
                </span>
              </div>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-8">
              {currentSlide.categories.map((cat, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white text-sm rounded-full border border-white/20"
                >
                  {cat}
                </span>
              ))}
            </div>

            {/* CTA Button */}
            <button className="px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-300">
              Shop Now →
            </button>
          </div>
        </div>

       
        {/* Navigation Arrows - Hidden on mobile */}
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

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {sliderData.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === index ? "bg-white w-6" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeaderDisplay;
