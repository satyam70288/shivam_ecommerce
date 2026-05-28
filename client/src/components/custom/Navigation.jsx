import React, { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
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
  { label: "Toys", slug: "toys", icon: <Package size={16} /> },
  { label: "Gifts", slug: "gifts", icon: <Gift size={16} /> },
  { label: "Stationery", slug: "stationery", icon: <PencilRuler size={16} /> },
  { label: "Cosmetic", slug: "cosmetics", icon: <Sparkles size={16} /> },
  { label: "Imitation Jewellery", slug: "imitation-jewellery", icon: <Gem size={16} /> },
  { label: "Pooja Samagri", slug: "pooja-essentials", icon: <Flower2 size={16} /> },
  { label: "Bags", slug: "bags", icon: <Backpack size={16} /> },
];

const linkClass = ({ isActive }) =>
  `
    flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full
    border transition-all duration-200 whitespace-nowrap font-sans
    ${
      isActive
        ? "nav-link-active"
        : "border-border text-foreground/80 hover:bg-muted hover:border-primary/20"
    }
  `;

export default function Navigation() {
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
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -200 : 200,
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
      if (container) container.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  return (
    <nav className="w-full border-b border-border bg-card shadow-sm font-sans">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3">
        <div className="hidden md:flex items-center justify-center font-sans relative">
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="p-2 rounded-full bg-muted hover:bg-accent mr-2 transition absolute left-0"
            >
              <ChevronLeft size={20} className="text-muted-foreground" />
            </button>
          )}

          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto scrollbar-hide justify-center"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <div className="flex items-center gap-2 md:gap-4 px-4">
              {navLinks.map((link, index) => (
                <NavLink key={index} to={`/category/${link.slug}`} className={linkClass}>
                  <span className="text-primary">{link.icon}</span>
                  <span className="font-medium text-sm tracking-wide">{link.label}</span>
                </NavLink>
              ))}
            </div>
          </div>

          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="p-2 rounded-full bg-muted hover:bg-accent ml-2 transition absolute right-0"
            >
              <ChevronRight size={20} className="text-muted-foreground" />
            </button>
          )}
        </div>

        <div className="flex md:hidden overflow-x-auto scrollbar-hide -mx-2 px-2 pb-2">
          <div className="flex items-center gap-2 min-w-max py-1">
            {navLinks.map((link, index) => (
              <NavLink key={index} to={`/category/${link.slug}`} className={linkClass}>
                <span className="text-primary">{link.icon}</span>
                <span className="font-medium text-sm">{link.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
