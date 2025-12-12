import ProductCard from "@/components/custom/ProductCard";

export default function ProductGrid({ products = [], loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border shadow rounded-xl p-3 animate-pulse">
            <div className="bg-gray-300 h-32 rounded mb-4" />
            <div className="h-4 bg-gray-300 w-3/4 mb-2 rounded" />
            <div className="h-3 bg-gray-200 w-1/2 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((p) => (
        <ProductCard key={p._id} {...p} />
      ))}
    </div>
  );
}
