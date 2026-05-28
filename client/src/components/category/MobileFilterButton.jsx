import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import FiltersSidebar from "./FiltersSidebar";
import { countActiveFilters } from "@/constants/filtersConfig";

export default function MobileFilterButton({
  selectedFilters = {},
  updateFilter = () => {},
  setSort = () => {},
  onClearAll = () => {},
  productCount = 0,
}) {
  const [open, setOpen] = useState(false);
  const appliedFilterCount = countActiveFilters(selectedFilters);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-border bg-card shadow-sm hover:border-primary/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg brand-gradient-bg text-primary-foreground">
            <SlidersHorizontal size={18} />
          </div>
          <div className="text-left">
            <div className="font-semibold text-foreground text-sm">Filters & Sort</div>
            <div className="text-xs text-muted-foreground">
              {appliedFilterCount > 0
                ? `${appliedFilterCount} active · ${productCount} items`
                : "Tap to refine results"}
            </div>
          </div>
        </div>
        {appliedFilterCount > 0 && (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary text-primary-foreground">
            {appliedFilterCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />

          <div
            className="absolute inset-y-0 right-0 w-full max-w-sm bg-card shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
              <h2 className="font-bold text-foreground">Filters</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-muted"
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3">
              <FiltersSidebar
                compact
                selectedFilters={selectedFilters}
                updateFilter={updateFilter}
                setSort={setSort}
                onClearAll={onClearAll}
              />
            </div>

            <div className="shrink-0 p-4 border-t border-border bg-card flex gap-2">
              {appliedFilterCount > 0 && (
                <button
                  type="button"
                  onClick={onClearAll}
                  className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted"
                >
                  Clear all
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 py-2.5 rounded-xl brand-gradient-bg text-primary-foreground text-sm font-semibold"
              >
                Show {productCount} items
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
