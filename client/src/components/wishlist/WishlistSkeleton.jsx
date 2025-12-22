// components/wishlist/WishlistSkeleton.jsx
import React from 'react';

const WishlistSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Header Skeleton */}
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-8"></div>
          
          <div className="flex flex-col items-center mb-12">
            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-6"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-4"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-96"></div>
          </div>
        </div>
      </div>

      {/* Products Grid Skeleton */}
      <div className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                <div className="aspect-square bg-gray-200 dark:bg-gray-700"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WishlistSkeleton;