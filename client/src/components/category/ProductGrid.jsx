import ProductCard from "@/components/custom/ProductCard";

export default function ProductGrid({ products = [], loading }) {
  const showFullSkeleton = loading && products.length === 0;

  if (showFullSkeleton) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border border-border shadow-sm rounded-xl p-3 animate-pulse">
            <div className="bg-muted h-32 rounded mb-4" />
            <div className="h-4 bg-muted w-3/4 mb-2 rounded" />
            <div className="h-3 bg-muted w-1/2 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!loading && products.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12">
        No products found in this category.
      </p>
    );
  }

  return (
    <div className="relative">
      {loading && products.length > 0 && (
        <div
          className="absolute inset-0 z-10 bg-background/40 pointer-events-none rounded-lg"
          aria-busy="true"
          aria-label="Updating products"
        />
      )}
      <div
        className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 transition-opacity duration-200 ${
          loading && products.length > 0 ? "opacity-70" : "opacity-100"
        }`}
      >
        {products.map((p) => (
          <ProductCard key={p._id} {...p} />
        ))}
      </div>
    </div>
  );
}
