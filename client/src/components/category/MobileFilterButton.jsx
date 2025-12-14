import { useState } from "react";
import { Filter } from "lucide-react";
import FiltersSidebar from "./FiltersSidebar";

export default function MobileFilterButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* FILTER BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg
          bg-white dark:bg-zinc-800 
          border border-gray-200 dark:border-zinc-700
          text-gray-700 dark:text-zinc-100
          shadow-sm"
      >
        <Filter size={16} /> Filters
      </button>

      {/* OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 flex justify-end"
          onClick={() => setOpen(false)}
        >
          {/* DRAWER */}
          <div
            onClick={(e) => e.stopPropagation()}
            className={`
              w-72 h-full bg-white dark:bg-zinc-900 p-6 shadow-xl overflow-y-auto
              transform transition-transform duration-300 ease-out
              ${open ? "translate-x-0" : "translate-x-full"}
            `}
          >
            <FiltersSidebar />
          </div>
        </div>
      )}
    </>
  );
}
