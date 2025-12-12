import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const sliderData = [
  {
    img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d",
    title: "Trending Toys Collection",
    subtitle: "Kids • Fun • Learning",
    categories: ["Toys", "Soft Toys", "Action Figures", "Educational"],
    overlay: "from-blue-900/70 via-blue-700/40 to-transparent",
  },
  {
    img: "https://images.unsplash.com/photo-1542992015-4a0b729b1385",
    title: "Special Gift Hampers",
    subtitle: "Perfect • Beautiful • Affordable",
    categories: ["Gift", "Birthday", "Anniversary", "Decor"],
    overlay: "from-pink-900/70 via-pink-700/50 to-transparent",
  },
];

const HeaderDisplay = () => {
  const [index, setIndex] = useState(0);
  const timeoutRef = useRef(null);

  const next = () => setIndex((i) => (i + 1) % sliderData.length);
  const prev = () => setIndex((i) => (i === 0 ? sliderData.length - 1 : i - 1));

  useEffect(() => {
    timeoutRef.current = setInterval(next, 6000);
    return () => clearInterval(timeoutRef.current);
  }, []);

  return (
    <div className="w-full relative overflow-hidden">
      <div className="
        relative w-full 
        h-[240px] sm:h-[340px] md:h-[420px] lg:h-[450px]
        overflow-hidden rounded-xl
      ">

        {/* SLIDER WRAPPER */}
        <div
          className="flex transition-transform duration-[1500ms] ease-in-out h-full"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {sliderData.map((slide, i) => (
            <div key={i} className="relative w-full h-full flex-shrink-0 group">

              {/* Smooth Zoom Image */}
              <img
                src={slide.img}
                className="
                  w-full h-full object-cover
                  scale-[1.05] group-hover:scale-[1.10]
                  transition-transform duration-[3000ms]
                "
              />

              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.overlay}`} />

              {/* TEXT + ANIMATION */}
              <div className="
                absolute left-6 sm:left-16 top-1/2 -translate-y-1/2 
                max-w-[70%] text-white space-y-4 z-20
              ">
                <h1 className="
                  text-xl sm:text-4xl lg:text-5xl font-extrabold drop-shadow-xl
                  animate-fadeLeft
                ">
                  {slide.title}
                </h1>

                <p className="text-sm sm:text-lg opacity-90 animate-fadeUp">
                  {slide.subtitle}
                </p>

                {/* Category Chips */}
                <div className="flex flex-wrap gap-2 sm:gap-3 animate-fadeUp">
                  {slide.categories.map((cat, idx) => (
                    <span
                      key={idx}
                      className="
                        px-3 py-1 sm:px-4 bg-white/20 backdrop-blur-md 
                        border border-white/30 text-[10px] sm:text-sm rounded-full 
                        shadow hover:bg-white/30 hover:scale-105 transition
                        animate-fadeScale
                      "
                    >
                      {cat}
                    </span>
                  ))}
                </div>

                {/* Button with Shine Animation */}
                <button className="
                  mt-3 px-5 py-2 bg-white/20 backdrop-blur-lg 
                  border border-white/40 rounded-full shadow-lg 
                  hover:scale-105 transition relative overflow-hidden
                ">
                  <span className="relative z-10">Explore Now →</span>

                  {/* Shine */}
                  <span className="
                    absolute inset-0 bg-gradient-to-r from-transparent 
                    via-white/70 to-transparent opacity-0 animate-shine
                  "></span>
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* LEFT ARROW */}
        <button
          onClick={prev}
          className="hidden sm:flex absolute top-1/2 left-5 -translate-y-1/2 
            bg-black/40 p-3 rounded-full text-white hover:bg-black/70 
            hover:scale-110 transition"
        >
          <ChevronLeft size={26} />
        </button>

        {/* RIGHT ARROW */}
        <button
          onClick={next}
          className="hidden sm:flex absolute top-1/2 right-5 -translate-y-1/2 
            bg-black/40 p-3 rounded-full text-white hover:bg-black/70 
            hover:scale-110 transition"
        >
          <ChevronRight size={26} />
        </button>

        {/* DOTS */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
          {sliderData.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`rounded-full transition-all ${
                i === index ? "w-8 h-2 bg-white shadow" : "w-3 h-3 bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeaderDisplay;
