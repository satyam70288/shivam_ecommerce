// components/Product/SimpleCartDrawer.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, X, RefreshCw } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCart } from "@/redux/slices/cartSlice";
import CartProduct from "../custom/CartProduct";
import { useNavigate, useLocation } from "react-router-dom";

const SimpleCartDrawer = ({ 
  iconSize = 20, 
  className = "", 
  open = false, 
  onOpenChange,
  showIconOnly = false,
  onCartUpdate
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const drawerRef = useRef(null);
  const backdropRef = useRef(null);
  const isMounted = useRef(true);
  
  // ✅ Track if cart has been fetched
  const hasFetchedRef = useRef(false);
  
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  const cartState = useSelector((state) => state.cart) || {};
  const items = cartState.items || [];
  const summary = cartState.summary || {
    itemCount: 0,
    subtotal: 0,
    discount: 0,
    total: 0
  };
  const loading = cartState.loading || false;

  const displayItems = items;
  const itemCount = summary.itemCount || 0;
  const subtotal = summary.subtotal || 0;
  const discount = summary.discount || 0;
  const total = summary.total || 0;

  const navigate = useNavigate();
  const location = useLocation();
  const isCheckoutPage = location.pathname === "/checkout";

  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  // ✅ FIXED: Stable fetch function - no loading dependency
  const fetchCartData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    // Agar already loading hai to skip
    if (loading) return;

    try {
      const result = await dispatch(fetchCart());
      if (isMounted.current && fetchCart.fulfilled.match(result) && onCartUpdate) {
        onCartUpdate(result.payload);
      }
    } catch (error) {
      console.error("Cart fetch error:", error);
    }
  }, [dispatch, isAuthenticated, onCartUpdate]); // ✅ Removed loading from deps

  // ✅ FIXED: Fetch only ONCE when drawer opens
  useEffect(() => {
    if (isOpen && isAuthenticated && !hasFetchedRef.current) {
      console.log("Fetching cart for first time");
      hasFetchedRef.current = true;
      fetchCartData();
    }
    
    // Reset when drawer closes
    if (!isOpen) {
      // Small delay to avoid race conditions
      setTimeout(() => {
        hasFetchedRef.current = false;
      }, 300);
    }
  }, [isOpen, isAuthenticated, fetchCartData]); // ✅ No loading dependency

  // ✅ FIXED: Refresh handler - manual refresh only
  const handleRefreshCart = useCallback(() => {
    if (!isAuthenticated || loading) return;
    console.log("Manual refresh");
    fetchCartData();
  }, [isAuthenticated, fetchCartData, loading]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, setIsOpen]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && backdropRef.current && backdropRef.current === e.target) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, setIsOpen]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (showIconOnly) {
    return (
      <button
        aria-label="Open cart"
        disabled={isCheckoutPage}
        className={`flex items-center justify-center ${className}`}
        onClick={() => setIsOpen(true)}
      >
        <ShoppingCart
          strokeWidth={1.5}
          size={iconSize}
          className={`transition-all duration-200 ${
            isCheckoutPage
              ? "opacity-40 cursor-not-allowed text-gray-400 dark:text-gray-600"
              : "text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 cursor-pointer hover:scale-105"
          }`}
        />
      </button>
    );
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        className="fixed right-0 top-0 h-full w-full sm:max-w-md bg-white dark:bg-gray-900 z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b dark:border-gray-700 bg-gradient-to-r from-emerald-50 to-white dark:from-gray-800 dark:to-gray-900 flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <ShoppingCart 
                size={24} 
                className="text-emerald-600 dark:text-emerald-400"
              />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 
                  flex items-center justify-center
                  bg-gradient-to-r from-emerald-500 to-green-600 
                  text-white text-[10px] font-bold rounded-full
                  ring-2 ring-white dark:ring-gray-900
                ">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Shopping Cart
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-0.5">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Refresh Button */}
            <button
              onClick={handleRefreshCart}
              disabled={loading || !isAuthenticated}
              className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh cart"
            >
              <RefreshCw 
                size={16} 
                className={`text-gray-500 dark:text-gray-400 ${loading ? "animate-spin" : ""}`}
              />
            </button>
            
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              aria-label="Close cart"
            >
              <X size={18} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {!isAuthenticated ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12 px-6">
              <ShoppingCart size={64} className="text-gray-300 dark:text-gray-700 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Please login to view cart
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">
                You need to be logged in to see your cart items
              </p>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 rounded-xl"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/login", { state: { from: location.pathname } });
                }}
              >
                Login
              </Button>
            </div>
          ) : displayItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12 px-6">
              <ShoppingCart size={64} className="text-gray-300 dark:text-gray-700 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Your cart is empty
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">
                Add some products to get started
              </p>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 rounded-xl"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/");
                }}
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              {displayItems.map((item, index) => (
                <CartProduct 
                  key={item._id || item.cartItemId || index}
                  {...item}
                  onUpdate={() => {
                    if (!loading) {
                      fetchCartData();
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {isAuthenticated && displayItems.length > 0 && (
          <div className="border-t dark:border-gray-700 bg-white dark:bg-gray-900 p-4 sm:p-6 space-y-3 sm:space-y-4">
            {/* Price Breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm sm:text-base">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between items-center text-sm sm:text-base">
                  <span className="text-gray-600 dark:text-gray-400">Discount</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    -₹{discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t dark:border-gray-700">
                <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                  Total
                </span>
                <div className="text-right">
                  <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Inclusive of all taxes
                  </p>
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <Button
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 
                hover:from-emerald-700 hover:to-green-700 
                dark:from-emerald-500 dark:to-green-500 
                dark:hover:from-emerald-600 dark:hover:to-green-600 
                text-white py-5 sm:py-6 text-base sm:text-lg font-semibold 
                rounded-xl shadow-lg hover:shadow-xl 
                transition-all duration-200 transform hover:scale-[1.02]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              disabled={loading || !displayItems.length}
              onClick={() => {
                setIsOpen(false);
                navigate("/checkout");
              }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <RefreshCw size={18} className="animate-spin" />
                  UPDATING...
                </span>
              ) : (
                "PROCEED TO SECURE CHECKOUT"
              )}
            </Button>

            {/* Continue Shopping Link */}
            <button
              onClick={() => setIsOpen(false)}
              className="w-full text-center text-sm text-gray-500 dark:text-gray-400 
                hover:text-emerald-600 dark:hover:text-emerald-400 
                transition-colors py-2"
            >
              Continue Shopping →
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default SimpleCartDrawer;