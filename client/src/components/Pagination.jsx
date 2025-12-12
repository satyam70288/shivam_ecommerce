import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="
          px-4 py-2 rounded-full border text-sm font-medium
          bg-background text-foreground
          hover:bg-muted transition
          disabled:opacity-40 disabled:cursor-not-allowed
        "
      >
        ← Prev
      </button>

      {/* Page Numbers */}
      {Array.from({ length: totalPages }).map((_, i) => {
        const page = i + 1;
        const isActive = page === currentPage;

        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`
              w-10 h-10 rounded-full text-sm font-medium
              transition
              ${
                isActive
                  ? "bg-foreground text-background shadow-md scale-105"
                  : "bg-background border text-foreground hover:bg-muted"
              }
            `}
          >
            {page}
          </button>
        );
      })}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="
          px-4 py-2 rounded-full border text-sm font-medium
          bg-background text-foreground
          hover:bg-muted transition
          disabled:opacity-40 disabled:cursor-not-allowed
        "
      >
        Next →
      </button>
    </div>
  );
};

export default Pagination;
