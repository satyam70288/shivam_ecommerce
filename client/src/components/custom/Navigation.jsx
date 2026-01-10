import React, { useState, useRef, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Package,
  Gift,
  PencilRuler,
  Sparkles,
  Gem,
  Flower2,
  Backpack,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navLinks = [
  { 
    label: "Toys", 
    slug: "toys", 
    icon: <Package size={16} />,
    iconColor: "text-blue-500"
  },
  { 
    label: "Gifts", 
    slug: "gifts", 
    icon: <Gift size={16} />,
    iconColor: "text-pink-500"
  },
  { 
    label: "Stationery", 
    slug: "stationery", 
    icon: <PencilRuler size={16} />,
    iconColor: "text-green-500"
  },
  { 
    label: "Cosmetic", 
    slug: "cosmetics", 
    icon: <Sparkles size={16} />,
    iconColor: "text-purple-500"
  },
  {
    label: "Imitation Jewellery",
    slug: "imitation-jewellery",
    icon: <Gem size={16} />,
    iconColor: "text-yellow-500"
  },
  {
    label: "Pooja Samagri",
    slug: "pooja-essentials",
    icon: <Flower2 size={16} />,
    iconColor: "text-orange-500"
  },
  { 
    label: "Bags", 
    slug: "bags", 
    icon: <Backpack size={16} />,
    iconColor: "text-indigo-500"
  },
];

export default function Navigation() {
  const { pathname } = useLocation();
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  const scroll = (direction) => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = 200;
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", checkScroll);
      }
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  return (
    <nav className="w-full border-b bg-gray-100 dark:bg-zinc-900 shadow-sm font-sans">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 font-sans">
        {/* Desktop: Horizontal Scroll with Arrows */}
        <div className="hidden md:flex items-center justify-center font-sans">
          {/* Left Arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="p-2 rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 mr-2 transition absolute left-0"
            >
              <ChevronLeft
                size={20}
                className="text-gray-600 dark:text-gray-300"
              />
            </button>
          )}

          {/* Category Links Container - CENTERED */}
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto scrollbar-hide justify-center"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <div className="flex items-center gap-2 md:gap-4 px-4">
              {navLinks.map((link, index) => (
                <NavLink
                  key={index}
                  to={`/category/${link.slug}`}
                   className={({ isActive }) =>
                  `
                    flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full
                    border transition-all duration-200 whitespace-nowrap font-sans 
                    ${
                      isActive
                        ? "bg-pink-50 border-pink-200 text-pink-600 dark:bg-pink-900/30 dark:border-pink-800 dark:text-pink-400"
                        : "border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
                    }
                  `
                }
                >
                  <span className={`transition-transform duration-300 group-hover:scale-110 ${link.iconColor}`}>
                    {link.icon}
                  </span>
                  <span className="
  font-medium text-sm 
  tracking-wide leading-tight
  group-hover:font-semibold
  transition-all duration-300
  drop-shadow-sm
">
  {link.label}
</span>
                </NavLink>
              ))}
            </div>
          </div>

          {/* Right Arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="p-2 rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 ml-2 transition absolute right-0"
            >
              <ChevronRight
                size={20}
                className="text-gray-600 dark:text-gray-300"
              />
            </button>
          )}
        </div>

        {/* Mobile: Simple Horizontal Scroll (No Drawer) */}
        <div className="flex md:hidden overflow-x-auto scrollbar-hide -mx-2 px-2 pb-2 font-sans">
          <div className="flex items-center gap-2 min-w-max py-1">
            {navLinks.map((link, index) => (
              <NavLink
                key={index}
                to={`/category/${link.slug}`}
                className={({ isActive }) =>
                  `
                    flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full
                    border transition-all duration-200 whitespace-nowrap
                    ${
                      isActive
                        ? "bg-pink-50 border-pink-200 text-pink-600 dark:bg-pink-900/30 dark:border-pink-800 dark:text-pink-400"
                        : "border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
                    }
                  `
                }
              >
                <span className={`transition-transform duration-300 ${link.iconColor}`}>
                  {link.icon}
                </span>
                <span className="font-medium text-sm">{link.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}