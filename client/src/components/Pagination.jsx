import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // Maximum visible page numbers
    
    if (totalPages <= maxVisible) {
      // Show all pages if total pages are less than maxVisible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate start and end
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if near boundaries
      if (currentPage <= 3) {
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }
      
      // Add ellipsis after first page if needed
      if (start > 2) {
        pages.push("ellipsis-left");
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (end < totalPages - 1) {
        pages.push("ellipsis-right");
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col items-center justify-center gap-4 mt-8 px-4">
      {/* Page Info */}
      <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
        Page <span className="font-bold text-gray-900 dark:text-white">{currentPage}</span> of{" "}
        <span className="font-bold text-gray-900 dark:text-white">{totalPages}</span>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-center gap-1 sm:gap-2">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`
            flex items-center justify-center
            w-10 h-10 sm:w-12 sm:h-12
            rounded-xl
            border border-gray-300 dark:border-zinc-700
            text-gray-700 dark:text-gray-300
            hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100
            dark:hover:bg-gradient-to-r dark:hover:from-blue-900/20 dark:hover:to-blue-800/20
            hover:text-blue-600 dark:hover:text-blue-400
            hover:border-blue-300 dark:hover:border-blue-600
            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent
            disabled:hover:text-gray-700 dark:disabled:hover:text-gray-300
            transition-all duration-300
            active:scale-95
            shadow-sm hover:shadow-md
          `}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {pageNumbers.map((page, index) => {
            if (page === "ellipsis-left" || page === "ellipsis-right") {
              return (
                <div
                  key={`ellipsis-${index}`}
                  className="
                    w-10 h-10
                    flex items-center justify-center
                    text-gray-400 dark:text-gray-500
                  "
                >
                  <MoreHorizontal className="w-4 h-4" />
                </div>
              );
            }

            const isActive = page === currentPage;
            const isEdge = page === 1 || page === totalPages;

            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`
                  flex items-center justify-center
                  w-10 h-10 sm:w-11 sm:h-11
                  rounded-xl
                  text-sm sm:text-base font-medium
                  transition-all duration-300
                  active:scale-95
                  ${isActive
                    ? `
                      bg-gradient-to-r from-blue-500 to-indigo-600
                      dark:from-blue-600 dark:to-indigo-700
                      text-white
                      shadow-lg shadow-blue-500/30 dark:shadow-blue-600/30
                      border-2 border-blue-400 dark:border-blue-500
                      transform scale-105
                    `
                    : `
                      border border-gray-300 dark:border-zinc-700
                      bg-white dark:bg-zinc-800
                      text-gray-700 dark:text-gray-300
                      hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100
                      dark:hover:bg-gradient-to-r dark:hover:from-zinc-700 dark:hover:to-zinc-800
                      hover:text-blue-600 dark:hover:text-blue-400
                      hover:border-blue-300 dark:hover:border-blue-600
                      hover:shadow-md
                    `
                  }
                  ${isEdge ? 'font-semibold' : ''}
                `}
                aria-label={`Go to page ${page}`}
                aria-current={isActive ? "page" : undefined}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`
            flex items-center justify-center
            w-10 h-10 sm:w-12 sm:h-12
            rounded-xl
            border border-gray-300 dark:border-zinc-700
            text-gray-700 dark:text-gray-300
            hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100
            dark:hover:bg-gradient-to-r dark:hover:from-blue-900/20 dark:hover:to-blue-800/20
            hover:text-blue-600 dark:hover:text-blue-400
            hover:border-blue-300 dark:hover:border-blue-600
            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent
            disabled:hover:text-gray-700 dark:disabled:hover:text-gray-300
            transition-all duration-300
            active:scale-95
            shadow-sm hover:shadow-md
          `}
          aria-label="Next page"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Jump to Page (Optional for Desktop) */}
      <div className="hidden sm:flex items-center gap-3 mt-4">
        <span className="text-sm text-gray-600 dark:text-gray-400">Jump to:</span>
        <select
          value={currentPage}
          onChange={(e) => onPageChange(Number(e.target.value))}
          className="
            px-3 py-2 rounded-lg
            border border-gray-300 dark:border-zinc-700
            bg-white dark:bg-zinc-800
            text-gray-900 dark:text-white
            focus:outline-none focus:ring-2 focus:ring-blue-500
            cursor-pointer
          "
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <option key={page} value={page}>
              Page {page}
            </option>
          ))}
        </select>
      </div>

      {/* Mobile Page Input (Optional) */}
      <div className="flex sm:hidden items-center gap-2 mt-4">
        <input
          type="number"
          min="1"
          max={totalPages}
          value={currentPage}
          onChange={(e) => {
            const value = Math.min(Math.max(1, parseInt(e.target.value) || 1), totalPages);
            onPageChange(value);
          }}
          className="
            w-20 px-3 py-2 rounded-lg
            border border-gray-300 dark:border-zinc-700
            bg-white dark:bg-zinc-800
            text-gray-900 dark:text-white text-center
            focus:outline-none focus:ring-2 focus:ring-blue-500
          "
        />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          of {totalPages}
        </span>
      </div>
    </div>
  );
};

export default Pagination;