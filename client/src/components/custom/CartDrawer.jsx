import React, { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "../ui/button";
import { ShoppingCart } from "lucide-react";
import { Badge } from "../ui/badge";
import { useSelector } from "react-redux";
import CartProduct from "./CartProduct";
import { useNavigate, useLocation } from "react-router-dom";

const CartDrawer = () => {
  const [open, setOpen] = useState(false);

  const { cartItems, totalQuantity, totalPrice } = useSelector(
    (state) => state.cart
  );

  const navigate = useNavigate();
  const location = useLocation();
  const isCheckoutPage = location.pathname === "/checkout";

  /**
   * 🔒 FORCE CLOSE CART WHEN USER REACHES CHECKOUT
   * (route change ≠ drawer close, isliye ye mandatory hai)
   */
  useEffect(() => {
    if (isCheckoutPage) {
      setOpen(false);
    }
  }, [isCheckoutPage]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* 🔒 Cart Trigger */}
      <div className="relative">
        <SheetTrigger
          aria-label="Open cart"
          disabled={isCheckoutPage}
          onClick={() => setOpen(true)}
        >
          <ShoppingCart
            strokeWidth={1.3}
            size={28}
            className={`transition-all ${
              isCheckoutPage
                ? "opacity-40 cursor-not-allowed"
                : "text-gray-800 dark:text-white hover:scale-105 cursor-pointer"
            }`}
          />
        </SheetTrigger>

        {isCheckoutPage && (
          <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 whitespace-nowrap">
            Cart is locked during checkout
          </p>
        )}

        {totalQuantity > 0 && !isCheckoutPage && (
          <Badge className="absolute -top-1 -right-1 px-1 py-0 text-xs">
            {totalQuantity}
          </Badge>
        )}
      </div>

      {/* 👉 Drawer */}
      <SheetContent side="right" className="w-full sm:w-[420px]">
        <SheetHeader>
          <SheetTitle>Your Cart</SheetTitle>
          <SheetDescription>
            Total Items: {totalQuantity} | Total Price: ₹{totalPrice}
          </SheetDescription>
        </SheetHeader>

        {/* ⚠️ Info */}
        {isCheckoutPage && <CheckoutInfoBanner />}

        {/* 🛒 Cart Items */}
        <div className="relative mt-4 w-[20rem] sm:w-[26rem] mx-auto">
          <div
            className="
              flex flex-col gap-4
              max-h-[55vh]
              overflow-y-auto
              scrollbar-none
              scroll-smooth
            "
          >
            {cartItems.length === 0 ? (
              <h2 className="text-primary text-sm">Nothing To Show...</h2>
            ) : (
              cartItems.map((item) => (
                <CartProduct key={item._id} {...item} />
              ))
            )}
          </div>
        </div>

        {/* 🔻 Footer */}
        <div className="mt-6 border-t pt-4 flex flex-col gap-3">
          <div className="flex justify-between text-base font-semibold">
            <span>Total:</span>
            <span>₹{totalPrice}</span>
          </div>

          <Button
            className="w-full"
            disabled={cartItems.length === 0}
            onClick={() => {
              setOpen(false);        // 🔥 CLOSE FIRST
              navigate("/checkout"); // 🔥 THEN NAVIGATE
            }}
          >
            Checkout
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;

/* ================= INFO BANNER ================= */

const CheckoutInfoBanner = () => {
  return (
    <div
      className="
        mt-3
        rounded-lg
        border
        px-3 py-2
        text-xs sm:text-sm
        flex items-start gap-2
        bg-yellow-50 border-yellow-200 text-yellow-800
        dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-200
      "
    >
      <span className="mt-[2px]">ℹ️</span>
      <p>
        Cart is locked during checkout to prevent price, discount, or stock
        changes. Please update your cart before proceeding.
      </p>
    </div>
  );
};
