import React from "react";
import { NavLink } from "react-router-dom";
import {
  Package,
  Gift,
  PencilRuler,
  Sparkles,
  Gem,
  Flower2,
  Backpack,
  AlignJustify,
  ChevronDown,
} from "lucide-react";

const navLinks = [
  { label: "Toys", slug: "toys", icon: <Package size={16} /> },
  { label: "Gift", slug: "gift", icon: <Gift size={16} /> },
  { label: "Stationery", slug: "stationery", icon: <PencilRuler size={16} /> },
  { label: "Cosmetic", slug: "cosmetic", icon: <Sparkles size={16} /> },
  { label: "Imitation Jewellery", slug: "imitation-jewellery", icon: <Gem size={16} /> },
  { label: "Pooja Samagri", slug: "pooja-samagri", icon: <Flower2 size={16} /> },
  { label: "Bags", slug: "bags", icon: <Backpack size={16} /> },
];

const Navigation = () => {
  return (
    <nav className="w-full border-b bg-white dark:bg-zinc-900 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between py-3 px-4">

        {/* LEFT SECTION */}
        <div
          className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md 
                     hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
        >
          <AlignJustify size={18} className="text-gray-700 dark:text-gray-300" />
          <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
            SHOP BY CATEGORIES
          </span>
          <ChevronDown size={14} className="text-gray-600 dark:text-gray-300" />
        </div>

        {/* CATEGORY LINKS */}
        <ul className="flex items-center gap-6 overflow-x-auto whitespace-nowrap">

          {navLinks.map((link, index) => (
            <li key={index} className="list-none">
              
              <NavLink
                to={`/category/${link.slug}`}
                className={({ isActive }) =>
                  `
                    group relative flex items-center gap-2 px-2 py-2 text-sm font-medium
                    transition-all duration-300
                    ${isActive ? "text-pink-600" : "text-gray-700 dark:text-gray-300 hover:text-pink-600"}
                  `
                }
              >
                {/* ICON WITH SLIDE ANIMATION */}
                <span className="transition-transform duration-300 group-hover:-translate-y-[2px]">
                  {link.icon}
                </span>

                {link.label}

                {/* UNDERLINE (ACTIVE + HOVER ANIMATION) */}
                <span
                  className={`
                    absolute bottom-0 left-1/2 h-[2px] bg-pink-500 rounded-full
                    transition-all duration-300 
                    ${/* Hover underline */""}
                    group-hover:w-3/4 group-hover:-translate-x-1/2

                    ${/* Active underline always visible */""}
                    ${(location.pathname === "/category/" + link.slug)
                      ? "w-3/4 -translate-x-1/2"
                      : "w-0"}
                  `}
                ></span>

              </NavLink>

            </li>
          ))}

        </ul>

      </div>
    </nav>
  );
};

export default Navigation;
