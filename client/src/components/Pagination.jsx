import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const page = Number(currentPage) || 1;
  const total = Number(totalPages) || 1;
  
  if (total <= 1) return null;

  return (
    <div className="flex flex-col items-center gap-4 my-8">
      {/* Info */}
      <div className="flex items-center gap-2 text-gray-600">
        <div className="px-3 py-1 bg-blue-100 rounded-lg">
          <span className="font-bold text-blue-700">{page}</span>
          <span className="mx-1">/</span>
          <span className="font-bold">{total}</span>
        </div>
        <span className="text-sm">pages</span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-30"
        >
          <ChevronLeft size={18} />
          <span className="font-medium">Previous</span>
        </button>

        {/* Pages */}
        <div className="flex items-center">
          {Array.from({ length: Math.min(2, total) }, (_, i) => {
            const pageNum = i + 1;
            const isActive = pageNum === page;
            
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`
                  w-10 h-10 mx-1 rounded-lg font-medium
                  transition-all duration-200
                  ${isActive
                    ? "bg-blue-600 text-white shadow-lg scale-105"
                    : "border hover:bg-gray-50"
                  }
                `}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === total}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-30"
        >
          <span className="font-medium">Next</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;