import { useParams } from "react-router-dom";
import useCategory from "@/hooks/useCategory";
import FiltersSidebar from "@/components/category/FiltersSidebar";
import ProductGrid from "@/components/category/ProductGrid";
import { FoldersIcon } from "lucide-react";
import NotFound from "@/components/Notfound/NotFound";
import MobileFilterButton from "@/components/category/MobileFilterButton";
import { useState, useCallback } from "react";
import { DEFAULT_FILTERS, countActiveFilters } from "@/constants/filtersConfig";

export default function CategoryPage() {
  const [selectedFilters, setSelectedFilters] = useState({ ...DEFAULT_FILTERS });

  const updateFilter = useCallback((key, value) => {
    setSelectedFilters((prev) => {
      const arr = prev[key] || [];
      if (arr.includes(value)) {
        return { ...prev, [key]: arr.filter((v) => v !== value) };
      }
      return { ...prev, [key]: [...arr, value] };
    });
  }, []);

  const setSort = useCallback((value) => {
    setSelectedFilters((prev) => ({ ...prev, sort: value }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setSelectedFilters({ ...DEFAULT_FILTERS });
  }, []);

  const { slug } = useParams();
  const { categoryName, products, loading, error } = useCategory(
    slug,
    selectedFilters
  );

  const activeCount = countActiveFilters(selectedFilters);

  if (error?.response?.status === 404) {
    return (
      <NotFound
        icon={<FoldersIcon className="w-20 h-20 text-gray-400" />}
        title="Category Not Found"
        message="This category doesn't exist."
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 flex flex-col md:flex-row gap-4 md:gap-6 min-h-screen bg-background">
      {/* Mobile filters */}
      <div className="md:hidden w-full">
        <MobileFilterButton
          selectedFilters={selectedFilters}
          updateFilter={updateFilter}
          setSort={setSort}
          onClearAll={clearAllFilters}
          productCount={products.length}
        />
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:block w-[248px] shrink-0 sticky top-20 self-start">
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden max-h-[calc(100vh-6rem)]">
          <div className="overflow-y-auto max-h-[calc(100vh-6rem)] scrollbar-thin">
            <FiltersSidebar
              selectedFilters={selectedFilters}
              updateFilter={updateFilter}
              setSort={setSort}
              onClearAll={clearAllFilters}
            />
          </div>
        </div>
      </aside>

      {/* Products */}
      <section className="flex-1 min-w-0">
        <div className="mb-4 px-1">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground capitalize">
            {categoryName || slug?.replace(/-/g, " ")}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading
              ? "Loading products..."
              : `${products.length} product${products.length !== 1 ? "s" : ""}`}
            {activeCount > 0 && ` · ${activeCount} filter${activeCount > 1 ? "s" : ""} applied`}
          </p>
        </div>

        {loading ? (
          <ProductGrid loading />
        ) : (
          <ProductGrid products={products} />
        )}
      </section>
    </div>
  );
}
