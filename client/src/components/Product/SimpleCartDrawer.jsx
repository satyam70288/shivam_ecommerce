// SimpleCartDrawer.jsx
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, X } from "lucide-react";
import { useSelector } from "react-redux";
import CartProduct from "../custom/CartProduct";
import { useNavigate, useLocation } from "react-router-dom";

const SimpleCartDrawer = ({ iconSize = 20, className = "" }) => {
  const [open, setOpen] = useState(false);
  const drawerRef = useRef(null);
  const backdropRef = useRef(null);

  // ✅ NEW REDUX STRUCTURE
  const { items, summary, loading } = useSelector((state) => state.cart);
  const cartItems = items || [];
  const totalQuantity = summary?.itemCount || 0;
  const totalPrice = summary?.total || 0;
  const subtotal = summary?.subtotal || 0;
  const discount = summary?.discount || 0;

  const navigate = useNavigate();
  const location = useLocation();
  const isCheckoutPage = location.pathname === "/checkout";

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (open && backdropRef.current && backdropRef.current === e.target) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  return (
    <>
      {/* Cart Icon Button */}
      <div className="relative">
        <button
          aria-label="Open cart"
          disabled={isCheckoutPage}
          className={`flex items-center justify-center ${className}`}
          onClick={() => setOpen(true)}
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
      </div>

      {/* Drawer */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            ref={backdropRef}
            className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
          />

          {/* Drawer Panel */}
          <div
            ref={drawerRef}
            className="fixed right-0 top-0 h-full w-full sm:max-w-md bg-white dark:bg-gray-900 z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b dark:border-gray-700 bg-gradient-to-r from-emerald-50 to-white dark:from-gray-800 dark:to-gray-900 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  SHOPPING CART
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  {totalQuantity} {totalQuantity === 1 ? "item" : "items"}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                aria-label="Close cart"
              >
                <X size={24} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12 px-6">
                  <ShoppingCart
                    size={64}
                    className="text-gray-300 dark:text-gray-700 mb-4"
                  />
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    Your cart is empty
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Add some products to get started
                  </p>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {cartItems.map((item) => (
                    <CartProduct key={item.productId} {...item} />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t dark:border-gray-700 bg-white dark:bg-gray-900 p-6 space-y-4">
              {/* Subtotal */}
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Subtotal
                </span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  ₹{subtotal.toLocaleString()}
                </span>
              </div>

              {/* Discount */}
              {discount > 0 && (
                <div className="flex justify-between items-center text-green-600">
                  <span>You save</span>
                  <span>-₹{discount.toLocaleString()}</span>
                </div>
              )}

              {/* Total */}
              <div className="flex justify-between items-center pt-4 border-t dark:border-gray-700">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  Total
                </span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₹{totalPrice.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Inclusive of all taxes
                  </div>
                </div>
              </div>

              {/* Checkout */}
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={cartItems.length === 0 || loading}
                onClick={() => {
                  setOpen(false);
                  navigate("/checkout");
                }}
              >
                PROCEED TO SECURE CHECKOUT555
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default SimpleCartDrawer;
