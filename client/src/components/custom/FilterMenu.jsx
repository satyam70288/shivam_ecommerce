import React, { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Search, X, Sparkles, Filter, SlidersHorizontal } from "lucide-react";

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
    <div className="w-full max-w-6xl mx-auto my-10 px-4">
      {/* Modern Search Container */}
      <div className="relative group">
        {/* Glow effect background */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
        
        {/* Main Search Card */}
        <div className="relative bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-1 shadow-xl">
          {/* Search Input with Advanced Styling */}
          <div className="relative">
            {/* Search Icon with Animation */}
            <div className={`
              absolute left-4 top-1/2 transform -translate-y-1/2
              transition-all duration-300
              ${isFocused || search ? 'text-blue-500 scale-110' : 'text-gray-400'}
            `}>
              <Search className="h-5 w-5" />
            </div>

            {/* Input Field */}
            <Input
              placeholder="Search for products, brands, categories..."
              value={search}
              onChange={handleSearchChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={`
                w-full h-16 pl-14 pr-14
                text-lg font-medium
                bg-transparent border-0
                placeholder:text-gray-400 dark:placeholder:text-zinc-500
                focus-visible:ring-0 focus-visible:ring-offset-0
                transition-all duration-300
                ${isFocused ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}
              `}
            />

            {/* Clear Button with Animation */}
            {search && (
              <button
                onClick={handleClearSearch}
                className={`
                  absolute right-4 top-1/2 transform -translate-y-1/2
                  p-2 rounded-full
                  bg-gray-100 dark:bg-zinc-800
                  hover:bg-gray-200 dark:hover:bg-zinc-700
                  text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300
                  transition-all duration-300
                  hover:scale-110 active:scale-95
                `}
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Microphone/Advanced Search Button */}
            {!search && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                <button
                  className="
                    p-2 rounded-lg
                    text-gray-400 hover:text-blue-500
                    hover:bg-blue-50 dark:hover:bg-blue-900/20
                    transition-colors duration-300
                    hidden sm:flex items-center gap-2
                  "
                  title="Advanced filters"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="text-sm font-medium">Filters</span>
                </button>
                <div className="h-6 w-px bg-gray-200 dark:bg-zinc-700"></div>
                <kbd className="
                  hidden sm:inline-flex items-center gap-1
                  px-2 py-1 rounded-md
                  text-xs font-mono font-medium
                  bg-gray-100 dark:bg-zinc-800
                  text-gray-600 dark:text-gray-400
                  border border-gray-200 dark:border-zinc-700
                ">
                  ⌘K
                </kbd>
              </div>
            )}
          </div>

          {/* Search Suggestions (Optional) */}
          {isFocused && !search && (
            <div className="
              absolute top-full left-0 right-0 mt-2
              bg-white dark:bg-zinc-900
              border border-gray-200 dark:border-zinc-800
              rounded-xl shadow-2xl
              overflow-hidden
              z-50
              animate-in fade-in slide-in-from-top-2 duration-300
            ">
              
            </div>
          )}
        </div>

        {/* Search Stats (Optional) */}
        {search && (
          <div className="
            mt-4 flex items-center justify-between
            px-2 animate-in fade-in duration-300
          ">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Searching for: <span className="font-semibold text-gray-900 dark:text-white">"{search}"</span>
              </p>
            </div>
            <button
              onClick={handleClearSearch}
              className="
                text-sm font-medium
                text-blue-600 dark:text-blue-400
                hover:text-blue-700 dark:hover:text-blue-300
                hover:underline transition-all duration-200
              "
            >
              Clear search
            </button>
          </div>
        )}
      </div>

      {/* Animated Border Effect */}
      <div className={`
        h-px w-full max-w-2xl mx-auto mt-6
        bg-gradient-to-r from-transparent via-gray-300 dark:via-zinc-600 to-transparent
        transition-opacity duration-300
        ${isFocused ? 'opacity-100' : 'opacity-50'}
      `}></div>
    </div>
  );
};

export default FilterMenu;