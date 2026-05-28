import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "../custom/ProductCard";

const SECTION_WRAP =
  "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12 lg:pt-16 pb-14 sm:pb-16 lg:pb-20";

const PRODUCT_GRID =
  "grid gap-4 sm:gap-5 md:gap-6 grid-cols-[repeat(auto-fill,minmax(10.5rem,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(11.5rem,1fr))] md:grid-cols-[repeat(auto-fill,minmax(12.5rem,1fr))]";

const SimilarProducts = ({ productId }) => {
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSimilarProducts = async () => {
    if (!productId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/similar/${productId}?limit=12`
      );

      if (response.data.success) {
        setSimilarProducts(response.data.data || []);
      } else {
        setError(response.data.message || "Unable to load similar products");
      }
    } catch (err) {
      console.error("Error fetching similar products:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load similar products"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSimilarProducts();
  }, [productId]);

  // Loading skeleton with shimmer effect
  if (loading) {
    return (
      <section className={SECTION_WRAP}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-8 w-48 bg-muted rounded-lg mb-2 animate-pulse" />
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className={PRODUCT_GRID}>
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className="group relative overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className="relative overflow-hidden bg-gray-200 dark:bg-gray-800 aspect-square">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
              </div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
                <div className="flex items-center justify-between pt-2">
                  <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-16"></div>
                  <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={SECTION_WRAP}>
        <h2 className="text-2xl font-bold text-foreground mb-6">
          Similar Products
        </h2>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10 border border-red-100 dark:border-red-800/30 p-6 sm:p-8">
          <div className="absolute top-4 right-4 opacity-10">
            {/* <ExclamationTriangleIcon className="w-24 h-24 text-red-500" /> */}
          </div>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                {/* <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" /> */}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Unable to Load Similar Products
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {error}
              </p>
              <button
                type="button"
                onClick={fetchSimilarProducts}
                className="inline-flex items-center px-4 py-2 brand-gradient-bg text-primary-foreground font-medium rounded-lg transition-all duration-300 hover:opacity-90"
              >
                {/* <ArrowPathIcon className="w-4 h-4 mr-2" /> */}
                Try Again
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (similarProducts.length === 0) {
    return (
      <section className={SECTION_WRAP}>
        <h2 className="text-2xl font-bold text-foreground mb-6">
          Similar Products
        </h2>
        <div className="text-center py-12 px-4 sm:px-6 rounded-2xl border-2 border-dashed border-border bg-muted/30">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl mb-4">
            <span className="text-2xl">🎯</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Unique Product
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            This product is one of a kind! We couldn't find similar items, but you might discover more unique finds in our collection.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={SECTION_WRAP}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8 sm:mb-10">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Similar Products
          </h2>
          <p className="text-muted-foreground mt-1.5 text-sm sm:text-base">
            Discover more items you might love
          </p>
        </div>
        <p className="text-sm text-muted-foreground shrink-0">
          {similarProducts.length} product{similarProducts.length !== 1 ? "s" : ""}{" "}
          found
        </p>
      </div>

      <div className={PRODUCT_GRID}>
        {similarProducts.map((product) => (
          <ProductCard key={product._id} {...product} />
        ))}
      </div>
    </section>
  );
};

export default SimilarProducts;