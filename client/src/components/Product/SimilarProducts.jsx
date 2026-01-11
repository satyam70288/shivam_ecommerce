// SimilarProducts.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../custom/ProductCard';
// import { ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const SimilarProducts = ({ productId }) => {
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/similar/${productId}?limit=12`
        );

        if (response.data.success) {
          setSimilarProducts(response.data.data || []);
        } else {
          setError(response.data.message || 'Unable to load similar products');
        }
      } catch (err) {
        console.error("Error fetching similar products:", err);
        setError(err.response?.data?.message || "Failed to load similar products");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchSimilarProducts();
    }
  }, [productId]);

  // Loading skeleton with shimmer effect
  if (loading) {
    return (
      <div className="mt-12 ">
        <div className="flex items-center justify-between mb-6 ">
          <div>
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg mb-2 animate-pulse"></div>
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
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
      </div>
    );
  }

  // Error state with retry option
  if (error) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
          Similar Products
        </h2>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10 border border-red-100 dark:border-red-800/30 p-8">
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
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-medium rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
              >
                {/* <ArrowPathIcon className="w-4 h-4 mr-2" /> */}
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No similar products
  if (similarProducts.length === 0) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
          Similar Products
        </h2>
        <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gradient-to-b from-gray-50 to-transparent dark:from-gray-900/50">
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
      </div>
    );
  }

  return (
    <section className="mt-12 lg:px-6">
      <div className="flex items-center justify-between mb-8">
        <div className='px-2'>
          <h2 className=" text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text">
            Similar Products
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Discover more items you might love
          </p>
        </div>
        <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <span className="inline-flex items-center">
            <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-2"></span>
            {similarProducts.length} products found
          </span>
        </div>
      </div>

      <div className="relative">
        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
          {similarProducts.map((product, index) => (
            <div
              key={product._id}
              className="transform transition-all duration-500 hover:-translate-y-2"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: 'fadeInUp 0.5s ease forwards',
                opacity: 0
              }}
            >
              <div className="relative group">
                {/* Card glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
                
                {/* Product card */}
                <div className="relative h-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300">
                  <ProductCard {...product} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View more button (optional) */}
        {similarProducts.length >= 6 && (
          <div className="text-center mt-10">
            <button className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 hover:from-gray-800 hover:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-800 text-white font-medium rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl">
              View All Similar Products
              <svg 
                className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </section>
  );
};

export default SimilarProducts;