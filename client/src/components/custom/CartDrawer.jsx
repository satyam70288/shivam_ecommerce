// CartDrawer.jsx
import React, { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "../ui/button";
import { ShoppingCart, X } from "lucide-react";
import { useSelector } from "react-redux";
import CartProduct from "./CartProduct";
import { useNavigate, useLocation } from "react-router-dom";

const CartDrawer = ({ iconSize = 20, className = "" }) => {
  const [open, setOpen] = useState(false);
  const { cartItems, totalQuantity, totalPrice } = useSelector((state) => state.cart);
  const navigate = useNavigate();
  const location = useLocation();
  const isCheckoutPage = location.pathname === "/checkout";

  useEffect(() => {
    if (isCheckoutPage) setOpen(false);
  }, [isCheckoutPage]);

  const getDiscountedPrice = (price) => Math.round(price * 1.5);

  // Check if click is on quantity control elements INSIDE the drawer
  const isQuantityControl = (target) => {
    // Check if the target is inside the drawer
    const isInsideDrawer = target.closest('[data-radix-sheet-content]') || 
                          target.closest('[role="dialog"]');
    
    if (!isInsideDrawer) return false;
    
    // Now check if it's a quantity control element
    return (
      target.closest('button[class*="rounded-full"]') ||
      target.closest('button[class*="bg-white"][class*="shadow-sm"]') ||
      target.closest('svg[data-icon*="minus"], svg[data-icon*="plus"]') ||
      target.closest('.text-gray-400[class*="cursor-pointer"]') ||
      target.closest('button[class*="hover:bg-gray-100"]')
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* Cart Icon */}
      <div className="relative">
        <SheetTrigger
          aria-label="Open cart"
          disabled={isCheckoutPage}
          className={`flex items-center justify-center ${className}`}
        >
          <ShoppingCart
            strokeWidth={1.5}
            size={iconSize}
            className={`transition-all duration-200 ${
              isCheckoutPage
                ? "opacity-40 cursor-not-allowed text-gray-400"
                : "text-emerald-600 hover:text-emerald-700 cursor-pointer hover:scale-105"
            }`}
          />
          {/* Badge */}
          {totalQuantity > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {totalQuantity}
            </span>
          )}
        </SheetTrigger>
      </div>

      {/* Drawer Content */}
      <SheetContent 
        side="right" 
        className="w-full sm:w-[440px] p-0 flex flex-col h-full"
        // Fix: Only prevent closing when clicking on quantity controls
        // Allow closing for backdrop clicks and close button
        onPointerDownOutside={(e) => {
          if (isQuantityControl(e.target)) {
            e.preventDefault();
          }
          // Backdrop clicks will close the drawer (default behavior)
        }}
        onInteractOutside={(e) => {
          if (isQuantityControl(e.target)) {
            e.preventDefault();
          }
          // Backdrop clicks will close the drawer (default behavior)
        }}
      >
        {/* Header with Close Button */}
        <div className="px-6 py-5 border-b bg-gradient-to-r from-emerald-50 to-white flex-shrink-0 relative">
          <h2 className="text-2xl font-bold text-gray-900">SHOPPING CART</h2>
          <p className="text-gray-500 text-sm mt-1">
            {totalQuantity} {totalQuantity === 1 ? "item" : "items"}
          </p>
          
          {/* Close Button */}
          <button
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => setOpen(false)}
            aria-label="Close cart"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ShoppingCart size={64} className="text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-700">Your cart is empty</h3>
              <p className="text-gray-500 mt-2">Add items to get started</p>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {cartItems.map((item) => (
                <CartProduct key={item.cartItemId} {...item} />
              ))}
            </div>
          )}
        </div>

        {/* Summary Section */}
        <div className="border-t bg-white px-6 py-5 space-y-4 flex-shrink-0">
          {/* Price Summary */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-emerald-600">
                  ₹{totalPrice?.toLocaleString()}
                </span>
                {totalPrice > 0 && (
                  <span className="text-sm text-gray-400 line-through">
                    ₹{getDiscountedPrice(totalPrice)?.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Delivery</span>
              <span className="text-emerald-600 font-medium">FREE</span>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center pt-4 border-t">
            <span className="text-lg font-bold text-gray-900">Total</span>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                ₹{totalPrice?.toLocaleString()}
              </div>
              {totalPrice > 0 && (
                <div className="text-sm text-emerald-600">
                  You save ₹{(getDiscountedPrice(totalPrice) - totalPrice)?.toLocaleString()}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              disabled={cartItems.length === 0}
              onClick={() => {
                setOpen(false);
                navigate("/checkout");
              }}
            >
              PROCEED TO SECURE CHECKOUT
            </Button>
            
            <Button
              variant="outline"
              className="w-full border-gray-300 py-6 text-lg rounded-xl hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;