import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";
import { useDispatch } from "react-redux";
import { setProducts as setReduxProducts } from "@/redux/slices/productSlice";
import { fetchWishlist } from "@/redux/slices/wishlistSlice";

const ProductList = ({ category = "All", price = "", search = "" }) => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();
  
  const dispatch = useDispatch();
  const limit = 12;

  // Fetch wishlist on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(fetchWishlist());
    }
  }, []);

  // Fetch products function
  const fetchProducts = useCallback(async (pageNum = 1, shouldAppend = false) => {
    try {
      setLoading(true);
      
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/get-products`,
        {
          params: {
            page: pageNum,
            limit,
            category: category !== "All" ? category : "",
            price: price || "",
            search: search || "",
          },
        }
      );

      const { data, pagination } = res.data;
      const newProducts = Array.isArray(data) ? data : [];
      
      if (shouldAppend) {
        // Append new products to existing ones
        setProducts(prev => [...prev, ...newProducts]);
      } else {
        // Reset products for new search/filter
        setProducts(newProducts);
      }
      
      // Update Redux
      dispatch(setReduxProducts(data));
      
      // Check if there are more pages
      const total = pagination?.totalProducts || 0;
      const totalPages = Math.ceil(total / limit);
      setHasMore(pageNum < totalPages);
      
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, [category, price, search, limit, dispatch]);

  // Initial fetch or when filters change
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchProducts(1, false);
  }, [category, price, search, fetchProducts]);

  // Load more when page changes
  useEffect(() => {
    if (page > 1) {
      fetchProducts(page, true);
    }
  }, [page, fetchProducts]);

  // Infinite Scroll Observer
  const lastProductRef = useCallback(node => {
    if (loading) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Loading skeleton
  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50/50 via-white/50 to-gray-100/50 dark:from-gray-900/50 dark:via-gray-900/50 dark:to-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
                  <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3" />
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50/50 via-white/50 to-gray-100/50 dark:from-gray-900/50 dark:via-gray-900/50 dark:to-gray-800/50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Results Header */}
        {search && (
          <div className="mb-6 animate-slideDown">
            <div className="inline-flex items-center px-4 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50">
              <svg 
                className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
              <span className="text-gray-600 dark:text-gray-300">
                Showing results for:{" "}
              </span>
              <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                "{search}"
              </span>
              <span className="ml-3 px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full font-medium">
                {products.length} items
              </span>
            </div>
          </div>
        )}

        {/* Products Count and Filter Info */}
        {/* {(category !== "All" || price) && !search && products.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {products.length} products
                {category !== "All" && ` in "${category}"`}
                {price && ` • Price: ${price}`}
              </div>
            </div>
          </div>
        )} */}

        {/* Products Grid */}
        {products.length > 0 ? (
          <>
            <div className="relative">
              {/* Subtle Background Pattern */}
{/* Background Pattern */}
<div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(0,0,0,0.02)_0%,transparent_55%),radial-gradient(circle_at_75%_75%,rgba(0,0,0,0.02)_0%,transparent_55%)] dark:bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.02)_0%,transparent_55%),radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.02)_0%,transparent_55%)] -z-10"  />              
              {/* Grid Container */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {products.map((p, index) => {
                  const isLastElement = index === products.length - 1;
                  return (
                    <div 
                      key={p._id} 
                      ref={isLastElement ? lastProductRef : null}
                      className="transform transition-all duration-300 hover:scale-[1.02] hover:z-10"
                    >
                      <div className="h-full">
                        <ProductCard {...p} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Loading Spinner for Infinite Scroll */}
            {loading && products.length > 0 && (
              <div className="flex flex-col items-center justify-center my-12 py-8">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
                  Loading more products...
                </p>
              </div>
            )}

            {/* End of Results Message */}
            {!hasMore && products.length > 0 && (
              <div className="flex justify-center my-12">
                <div className="text-center px-6 py-4 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20 flex items-center justify-center">
                    <svg 
                      className="w-6 h-6 text-emerald-600 dark:text-emerald-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M5 13l4 4L19 7" 
                      />
                    </svg>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-semibold">
                    🎉 All products loaded
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Showing {products.length} products • No more items to load
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                <svg 
                  className="w-10 h-10 text-gray-400 dark:text-gray-500" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                No products found
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {search || category !== "All" || price 
                  ? "Try adjusting your search or filter to find what you're looking for."
                  : "Check back later for new products."
                }
              </p>

              {/* Suggestions */}
              {(search || category !== "All" || price) && (
                <div className="mt-6 p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Suggestions:
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      Check your spelling
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      Try more general keywords
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      Browse different categories
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Back to Top Button (when scrolled) */}
      {products.length > 8 && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 w-12 h-12 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-center hover:bg-white dark:hover:bg-gray-800 hover:shadow-xl transition-all duration-300 z-50"
          aria-label="Back to top"
        >
          <svg 
            className="w-5 h-5 text-gray-600 dark:text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 10l7-7m0 0l7 7m-7-7v18" 
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ProductList;