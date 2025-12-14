import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
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
  X,
} from "lucide-react";

const navLinks = [
  { label: "Toys", slug: "toys", icon: <Package size={16} /> },
  { label: "Gift", slug: "gifts", icon: <Gift size={16} /> },
  { label: "Stationery", slug: "stationery", icon: <PencilRuler size={16} /> },
  { label: "Cosmetic", slug: "cosmetics", icon: <Sparkles size={16} /> },
  { label: "Imitation Jewellery", slug: "imitation-jewellery", icon: <Gem size={16} /> },
  { label: "Pooja Samagri", slug: "pooja-essentials", icon: <Flower2 size={16} /> },
  { label: "Bags", slug: "bags", icon: <Backpack size={16} /> },
];

export default function Navigation() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full border-b bg-white dark:bg-zinc-900 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between py-3 px-4">

        {/* LEFT: Mobile menu button */}
        <button
          className="flex items-center gap-2 px-3 py-2 rounded-md 
                     hover:bg-gray-100 dark:hover:bg-zinc-800 transition
                     md:hidden"
          onClick={() => setOpen(true)}
        >
          <AlignJustify size={20} className="text-gray-700 dark:text-gray-300" />
        </button>

        {/* LEFT: Desktop "Shop by Categories" */}
        <div
          className="hidden md:flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md 
                     hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
        >
          <AlignJustify size={18} className="text-gray-700 dark:text-gray-300" />
          <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
            SHOP BY CATEGORIES
          </span>
          <ChevronDown size={14} className="text-gray-600 dark:text-gray-300" />
        </div>

        {/* CATEGORY LINKS (Horizontal Scroll on Mobile) */}
        <ul className="
          hidden md:flex  items-center gap-6 overflow-x-auto whitespace-nowrap
          scrollbar-hide 
          w-full md:w-auto
          sm:hidden
        ">
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
                <span className="transition-transform duration-300 group-hover:-translate-y-[2px]">
                  {link.icon}
                </span>

                {link.label}

                {/* underline animation */}
                <span
                  className={`
                    absolute bottom-0 left-1/2 h-[2px] bg-pink-500 rounded-full
                    transition-all duration-300 
                    group-hover:w-3/4 group-hover:-translate-x-1/2
                    ${pathname === "/category/" + link.slug ? "w-3/4 -translate-x-1/2" : "w-0"}
                  `}
                ></span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* MOBILE MENU DRAWER */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 flex"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-64 bg-white dark:bg-zinc-900 p-6 shadow-md h-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button className="mb-6" onClick={() => setOpen(false)}>
              <X size={20} className="text-gray-700 dark:text-gray-300" />
            </button>

            {/* Mobile Nav Links */}
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.slug}
                  to={`/category/${link.slug}`}
                  onClick={() => setOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg
                    ${pathname === "/category/" + link.slug 
                      ? "bg-pink-50 text-pink-600 dark:bg-zinc-800"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"}
                  `}
                >
                  {link.icon}
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
