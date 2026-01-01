import { useState } from "react";
import { Filter, X, ChevronRight, Check, SlidersHorizontal } from "lucide-react";
import FiltersSidebar from "./FiltersSidebar";

export default function MobileFilterButton({ 
  selectedFilters = {},
  updateFilter = () => {}
}) {
  const [open, setOpen] = useState(false);

  // Calculate applied filters count
  const appliedFilterCount = Object.values(selectedFilters)
    .flat()
    .filter(Boolean).length;

  return (
    <>
      {/* MODERN FILTER BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className="
          w-full max-w-md mx-auto
          px-5 py-3
          flex items-center justify-between
          bg-gradient-to-r from-blue-500 to-indigo-600
          dark:from-blue-600 dark:to-indigo-700
          text-white font-semibold rounded-2xl
          shadow-lg shadow-blue-500/25 dark:shadow-blue-600/25
          hover:shadow-xl hover:shadow-blue-500/35 dark:hover:shadow-blue-600/35
          active:scale-[0.98] transition-all duration-300
          relative overflow-hidden
          group
        "
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
          translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        
        {/* Left content */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
            <SlidersHorizontal size={20} className="text-white" />
          </div>
          <div className="text-left">
            <div className="text-lg font-bold">Filters</div>
            <div className="text-sm font-medium text-white/90 opacity-90">
              {appliedFilterCount > 0 
                ? `${appliedFilterCount} filter${appliedFilterCount > 1 ? 's' : ''} applied`
                : 'Tap to filter products'}
            </div>
          </div>
        </div>

        {/* Right content */}
        <div className="flex items-center gap-2 relative z-10">
          {appliedFilterCount > 0 && (
            <div className="
              px-3 py-1.5 
              bg-white text-blue-600 dark:text-blue-700
              font-bold text-sm rounded-full
              animate-pulse-subtle
            ">
              {appliedFilterCount}
            </div>
          )}
          <ChevronRight size={20} className="text-white/90" />
        </div>
      </button>

      {/* MODERN DRAWER OVERLAY */}
      {open && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop with blur */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          
          {/* Animated Drawer */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="
              absolute inset-y-0 right-0
                w-full max-w-xs sm:max-w-sm  // ✅ YAHAN CHANGE KARO
              bg-gradient-to-b from-white to-gray-50
              dark:from-zinc-900 dark:to-zinc-950
              shadow-2xl shadow-black/30
              transform transition-transform duration-500 ease-out
              flex flex-col
            "
            style={{ 
              animation: open 
                ? 'slideInRight 0.5s ease-out forwards' 
                : 'slideOutRight 0.5s ease-in forwards'
            }}
          >
            {/* Drawer Header */}
            <div className="
              sticky top-0 z-10
              px-6 py-5
              bg-gradient-to-r from-blue-500 to-indigo-600
              dark:from-blue-600 dark:to-indigo-700
              text-white
              shadow-lg
            ">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Filter size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Filters</h2>
                    <p className="text-sm text-white/90 opacity-90">
                      Refine your product search
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => setOpen(false)}
                  className="
                    p-2 rounded-xl
                    bg-white/20 hover:bg-white/30
                    backdrop-blur-sm
                    transition-colors duration-300
                  "
                >
                  <X size={20} />
                </button>
              </div>

              {/* Applied filters summary */}
              {appliedFilterCount > 0 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-green-300" />
                    <span className="text-sm font-medium">
                      {appliedFilterCount} filter{appliedFilterCount > 1 ? 's' : ''} active
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      // Clear all filters logic
                      Object.keys(selectedFilters).forEach(key => {
                        selectedFilters[key]?.forEach(value => {
                          updateFilter(key, value);
                        });
                      });
                    }}
                    className="
                      text-sm font-medium
                      text-white/90 hover:text-white
                      underline decoration-dotted
                    "
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <FiltersSidebar 
                selectedFilters={selectedFilters}
                updateFilter={updateFilter}
              />
            </div>

            {/* Fixed Bottom Actions */}
            <div className="
              sticky bottom-0
              p-6 pt-4
              border-t border-gray-200 dark:border-zinc-800
              bg-white dark:bg-zinc-900
              shadow-lg
            ">
              
            </div>
          </div>
        </div>
      )}

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        
        .animate-pulse-subtle {
          animation: pulse-subtle 2s infinite;
        }
        
        @keyframes pulse-subtle {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
      `}</style>
    </>
  );
}