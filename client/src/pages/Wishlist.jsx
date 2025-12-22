// pages/Wishlist.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  ShoppingBag, 
  ArrowLeft, 
  Trash2, 
  Sparkles, 
  Filter,
  X,
  AlertCircle,
  ShoppingCart,
  Share2
} from 'lucide-react';

import { fetchWishlist, toggleWishlist, clearWishlist } from '@/redux/slices/wishlistSlice';
import { toast } from '@/hooks/use-toast';
import EmptyWishlist from '@/components/wishlist/EmptyWishlist';
import WishlistSkeleton from '@/components/wishlist/WishlistSkeleton';
import ProductCard from '@/components/custom/ProductCard';

const WishlistPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items: wishlistItems, loading, wishlistStatus } = useSelector((state) => state.wishlist);
  console.log(wishlistItems,"wishlistItems")
  const [selectedItems, setSelectedItems] = useState([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [sortBy, setSortBy] = useState('recent');

  // Fetch wishlist on mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [isAuthenticated, dispatch]);

  // Handle item selection
  const handleSelectItem = (productId) => {
    setSelectedItems(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === wishlistItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(wishlistItems.map(item => item._id));
    }
  };

  // Remove selected items
  const handleRemoveSelected = async () => {
    if (selectedItems.length === 0) return;
    
    try {
      for (const productId of selectedItems) {
        await dispatch(toggleWishlist(productId)).unwrap();
      }
      
      setSelectedItems([]);
      toast({
        title: "Removed from wishlist",
        description: `${selectedItems.length} items removed successfully`,
      });
    } catch (error) {
      toast({
        title: "Failed to remove items",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  // Clear entire wishlist
  const handleClearWishlist = async () => {
    try {
      // या तो backend में clear endpoint call करें
      // या हर item को individually remove करें
      dispatch(clearWishlist());
      setSelectedItems([]);
      setShowClearConfirm(false);
      
      toast({
        title: "Wishlist cleared",
        description: "All items removed from wishlist",
      });
    } catch (error) {
      toast({
        title: "Failed to clear wishlist",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  // Move selected to cart
  const handleMoveToCart = () => {
    // Implement cart logic here
    toast({
      title: "Added to cart",
      description: `${selectedItems.length} items moved to cart`,
    });
    setSelectedItems([]);
  };

  // Sort wishlist items
  const getSortedItems = () => {
    const items = [...wishlistItems];
    
    switch (sortBy) {
      case 'priceLowToHigh':
        return items.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'priceHighToLow':
        return items.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'name':
        return items.sort((a, b) => a.name.localeCompare(b.name));
      case 'recent':
      default:
        return items; // API से आते ही sorted होते हैं
    }
  };

  const sortedItems = getSortedItems();

  // If not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="relative mb-8">
            <Heart className="w-24 h-24 text-gray-300 dark:text-gray-700 mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <AlertCircle className="w-12 h-12 text-amber-500 animate-pulse" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Access Your Wishlist
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Login to save your favorite products and access them anytime from any device.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Sign In to View
            </button>
            
            <button
              onClick={() => navigate('/products')}
              className="px-8 py-3 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:border-amber-500 hover:text-amber-600 dark:hover:border-amber-500 transition-all duration-300"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return <WishlistSkeleton />;
  }

  // Empty wishlist
  if (wishlistItems.length === 0) {
    return <EmptyWishlist />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-amber-500/10" />
        
        <div className="relative container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link 
                to="/" 
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Back to Home</span>
              </Link>
              
              <button
                onClick={() => navigate('/products')}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <ShoppingBag size={18} />
                <span>Continue Shopping</span>
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
                <span className="hidden sm:inline">Clear All</span>
              </button>
              
              <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <Share2 size={18} />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>
          </div>
          
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500 to-amber-500 rounded-2xl shadow-2xl mb-6">
              <Heart className="w-10 h-10 text-white" fill="white" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              My Wishlist
            </h1>
            
            <div className="flex items-center justify-center gap-6 text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Heart size={18} className="text-pink-500" />
                <span className="text-lg font-semibold">{wishlistItems.length} Items</span>
              </div>
              
              <div className="w-1 h-1 bg-gray-300 rounded-full" />
              
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-amber-500" />
                <span className="text-lg">Saved for later</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-20">
        {/* Action Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 mb-8 sticky top-4 z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedItems.length === wishlistItems.length && wishlistItems.length > 0}
                  onChange={handleSelectAll}
                  className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  Select All ({selectedItems.length}/{wishlistItems.length})
                </span>
              </div>
              
              {selectedItems.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-amber-600 font-semibold">
                    {selectedItems.length} selected
                  </span>
                  <div className="w-1 h-1 bg-gray-300 rounded-full" />
                  <button
                    onClick={handleRemoveSelected}
                    className="text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <Trash2 size={16} />
                    Remove Selected
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Filter size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="pl-10 pr-8 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="recent">Recently Added</option>
                  <option value="priceLowToHigh">Price: Low to High</option>
                  <option value="priceHighToLow">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>
              
              {selectedItems.length > 0 && (
                <button
                  onClick={handleMoveToCart}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <ShoppingCart size={18} />
                  Move to Cart
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedItems.map((product) => (
            <div key={product._id} className="relative group">
              {/* Selection Checkbox */}
              <div className="absolute top-4 left-4 z-20">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(product._id)}
                  onChange={() => handleSelectItem(product._id)}
                  className="w-6 h-6 rounded-full border-2 border-gray-300 bg-white/90 backdrop-blur-sm checked:bg-amber-500 checked:border-amber-500 focus:ring-amber-500 transition-all duration-200"
                />
              </div>
              
              {/* Quick Remove Button */}
              <button
                onClick={() => handleSelectItem(product._id)}
                className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={18} className="text-red-500" />
              </button>
              
              <ProductCard {...product} />
            </div>
          ))}
        </div>

        {/* Stats & Summary */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-pink-50 to-amber-50 dark:from-pink-900/20 dark:to-amber-900/20 rounded-xl">
              <Heart className="w-8 h-8 text-pink-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Total Items
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {wishlistItems.length}
              </p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 rounded-xl">
              <ShoppingBag className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Ready to Buy
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {wishlistItems.filter(item => item.stock > 0).length}
              </p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
              <Sparkles className="w-8 h-8 text-purple-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                With Offers
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {wishlistItems.filter(item => item.discount > 0).length}
              </p>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Your wishlist is automatically saved and synced across all devices.
            </p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <button
                onClick={() => navigate('/products')}
                className="px-8 py-3 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:border-amber-500 hover:text-amber-600 dark:hover:border-amber-500 transition-all duration-300"
              >
                Discover More Products
              </button>
              
              <button
                onClick={() => window.print()}
                className="px-8 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Print Wishlist
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Clear Wishlist?
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to remove all {wishlistItems.length} items from your wishlist? This action cannot be undone.
              </p>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-3 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
              >
                Cancel
              </button>
              
              <button
                onClick={handleClearWishlist}
                className="flex-1 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;