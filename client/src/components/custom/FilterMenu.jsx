import React, { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Search, X } from "lucide-react";

const FilterMenu = ({ onSearch }) => {
  const [search, setSearch] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) onSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, onSearch]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleClearSearch = () => {
    setSearch("");
    if (onSearch) onSearch("");
  };

  return (
    <div className="w-full px-3 sm:px-4 lg:px-6 pt-4 sm:py-6 bg-background dark:bg-background bg-gray-100">
      {/* Modern Search Container - Mobile Optimized */}
      <div className="relative max-w-4xl mx-auto">
        {/* Subtle Glow Effect - Mobile Friendly */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur-sm opacity-10 group-hover:opacity-15 transition-opacity duration-300"></div>
        
        {/* Main Search Card - Responsive */}
        <div className="relative bg-white dark:bg-zinc-900/95 backdrop-blur-sm border border-gray-100 dark:border-zinc-800/80 rounded-xl sm:rounded-2xl shadow-sm sm:shadow-lg p-0.5 sm:p-1">
          
          {/* Search Input Container */}
          <div className="relative">
            {/* Search Icon - Responsive */}
            <div className={`
              absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2
              transition-all duration-200
              ${isFocused || search ? 'text-blue-500' : 'text-gray-400 dark:text-zinc-500'}
            `}>
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>

            {/* Input Field - Responsive */}
            <Input
              placeholder="Search products..."
              value={search}
              onChange={handleSearchChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={`
                w-full h-10 sm:h-10 md:h-10
                pl-10 sm:pl-12 pr-10 sm:pr-12
                text-base sm:text-lg font-normal sm:font-medium
                bg-transparent border-0
                placeholder:text-gray-400 dark:placeholder:text-zinc-500
                placeholder:text-sm sm:placeholder:text-base
                focus-visible:ring-0 focus-visible:ring-offset-0
                transition-all duration-200
                ${isFocused ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}
                rounded-xl
              `}
            />

            {/* Clear Button - Responsive */}
            {search && (
              <button
                onClick={handleClearSearch}
                className={`
                  absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2
                  p-1.5 sm:p-2 rounded-full
                  bg-gray-100 dark:bg-zinc-800/70
                  hover:bg-gray-200 dark:hover:bg-zinc-700
                  text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300
                  transition-all duration-200
                  active:scale-95
                `}
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            )}

            {/* Right Side Elements - Hidden on Mobile for Clean Look */}
            {!search && (
              <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                {/* Keyboard Shortcut - Desktop Only */}
                <kbd className="
                  hidden md:inline-flex items-center
                  px-2 py-1 rounded
                  text-xs font-mono
                  bg-gray-100 dark:bg-zinc-800
                  text-gray-600 dark:text-gray-400
                  border border-gray-200 dark:border-zinc-700
                ">
                  ⌘K
                </kbd>
              </div>
            )}
          </div>

          {/* Search Suggestions - Mobile Optimized */}
          {isFocused && !search && (
            <div className="
              absolute top-full left-0 right-0 mt-1 sm:mt-2
              bg-white dark:bg-zinc-900
              border border-gray-100 dark:border-zinc-800
              rounded-lg sm:rounded-xl shadow-lg
              overflow-hidden
              z-50
              animate-in fade-in slide-in-from-top-1 duration-200
            ">
              {/* <div className="p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mb-2">
                  Popular searches
                </p>
                <div className="space-y-1">
                  {["Mobile", "Laptop", "Headphones", "Watch", "Shoes"].map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        setSearch(item);
                        if (onSearch) onSearch(item);
                      }}
                      className="
                        w-full text-left px-3 py-2 rounded-lg
                        text-sm text-gray-700 dark:text-gray-300
                        hover:bg-gray-50 dark:hover:bg-zinc-800
                        transition-colors duration-150
                      "
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div> */}
            </div>
          )}
        </div>

        {/* Search Status - Responsive */}
        {search && (
          <div className="
            mt-3 sm:mt-4 px-1 sm:px-2
            animate-in fade-in duration-200
            flex flex-col sm:flex-row sm:items-center justify-between gap-2
          ">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                Searching: <span className="font-medium text-gray-900 dark:text-white">"{search}"</span>
              </p>
            </div>
            <button
              onClick={handleClearSearch}
              className="
                text-xs sm:text-sm font-medium
                text-blue-600 dark:text-blue-400
                hover:text-blue-700 dark:hover:text-blue-300
                hover:underline transition-all duration-200
                text-right
              "
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Bottom Border Effect - Subtle on Mobile */}
      <div className={`
        h-[0.5px] sm:h-px w-full max-w-2xl mx-auto mt-4 sm:mt-6
        bg-gradient-to-r from-transparent via-gray-200 dark:via-zinc-700 to-transparent
        transition-opacity duration-300
        ${isFocused ? 'opacity-70' : 'opacity-30'}
      `}></div>
    </div>
  );
};

export default FilterMenu;