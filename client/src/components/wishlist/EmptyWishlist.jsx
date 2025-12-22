// components/wishlist/EmptyWishlist.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Sparkles } from 'lucide-react';

const EmptyWishlist = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <div className="relative mb-10">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 bg-gradient-to-br from-pink-500/10 to-amber-500/10 rounded-full animate-pulse" />
          </div>
          <Heart className="w-32 h-32 text-gray-300 dark:text-gray-700 mx-auto relative" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-amber-500 rounded-full flex items-center justify-center shadow-2xl">
              <Heart className="w-10 h-10 text-white" fill="white" />
            </div>
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Your Wishlist is Empty
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-lg mx-auto">
          Save your favorite products here to easily find them later. Start exploring our collection!
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6 text-pink-500" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Save Favorites
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Click the heart icon on any product
            </p>
          </div>
          
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-amber-500" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Compare Later
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Review and compare saved items
            </p>
          </div>
          
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Quick Purchase
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Buy directly from wishlist
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/products"
            className="px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-2xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center gap-3"
          >
            <ShoppingBag size={20} />
            Start Shopping Now
          </Link>
          
          <Link
            to="/categories"
            className="px-10 py-4 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-2xl hover:border-amber-500 hover:text-amber-600 dark:hover:border-amber-500 transition-all duration-300"
          >
            Browse Categories
          </Link>
        </div>
        
        <div className="mt-12">
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            Your wishlist is automatically saved and synced across all your devices
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmptyWishlist;