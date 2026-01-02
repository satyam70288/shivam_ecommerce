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
      <div className="max-w-7xl mx-auto grid gap-5 grid-cols-[repeat(auto-fill,minmax(160px,1fr))] px-4 py-10">
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
    <>
      {products.length > 0 ? (
        <>
          {/* Search info */}
          {search && (
            <div className="w-[93vw] mx-auto mb-6 text-gray-600">
              Showing results for:{" "}
              <span className="font-semibold">"{search}"</span>
              <span className="ml-2 text-sm text-gray-500">
                ({products.length} products loaded)
              </span>
            </div>
          )}

          {/* Products Grid */}
          <div className="w-[93vw] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 mx-auto gap-4 place-content-center mb-10">
            {products.map((p, index) => {
              // Last product gets the observer
              if (index === products.length - 1) {
                return (
                  <div key={p._id} className="w-full" ref={lastProductRef}>
                    <ProductCard {...p} />
                  </div>
                );
              }
              return (
                <div key={p._id} className="w-full">
                  <ProductCard {...p} />
                </div>
              );
            })}
          </div>

          {/* Loading spinner for infinite scroll */}
          {loading && products.length > 0 && (
            <div className="flex justify-center my-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* No more products message */}
          {!hasMore && products.length > 0 && (
            <div className="text-center py-8 text-gray-500">
              No more products to load
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">No products found</p>
          {(search || category !== "All" || price) && (
            <p className="text-sm text-gray-400 mt-2">
              Try different search terms or filters
            </p>
          )}
        </div>
      )}
    </>
  );
};

export default ProductList;


// Option 1: Remove Pagination import and usage completely

// Option 2: Toggle between pagination and infinite scroll
// const [viewMode, setViewMode] = useState("infinite"); // "infinite" or "pagination"

// // In return:
// {viewMode === "pagination" && totalPages > 1 && (
//   <Pagination
//     currentPage={page}
//     totalPages={totalPages}
//     onPageChange={setPage}
//   />
// )}

// {viewMode === "infinite" && loading && products.length > 0 && (
//   <div className="flex justify-center my-8">
//     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//   </div>
// )}