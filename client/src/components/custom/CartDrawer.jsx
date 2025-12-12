import React from "react";
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
import { useNavigate } from "react-router-dom";

const CartDrawer = () => {
  const { cartItems, totalQuantity, totalPrice } = useSelector(
    (state) => state.cart
  );

  const navigate = useNavigate();

  return (
    <Sheet>
      <SheetTrigger className="relative" aria-label="Open cart">
        <ShoppingCart
          className="text-gray-800 dark:text-white hover:scale-105 transition-all cursor-pointer"
          strokeWidth={1.3}
          size={28}
        />
        {totalQuantity > 0 && (
          <Badge className="absolute top-0 right-0 px-1 py-0 text-xs">
            {totalQuantity}
          </Badge>
        )}
      </SheetTrigger>

      {/* ✅ Right side */}
      <SheetContent side="right" className="w-full sm:w-[420px]">
        <SheetHeader>
          <SheetTitle>Your Cart</SheetTitle>
          <SheetDescription>
            Total Items: {totalQuantity}, Total Price: ₹{totalPrice}
          </SheetDescription>
        </SheetHeader>

        {/* Cart Items */}
       <div className="relative mt-4 w-[20rem] sm:w-[26rem] mx-auto">
  <div
    className="
      flex flex-col gap-4
      max-h-[55vh]
      overflow-y-auto
      scrollbar-none
      scroll-smooth
      w-full
    "
    // style={{
    //   maskImage:
    //     "linear-gradient(to bottom, transparent 5%, black 20%, black 80%, transparent 95%)",
    //   WebkitMaskImage:
    //     "linear-gradient(to bottom, transparent 5%, black 20%, black 80%, transparent 95%)",
    // }}
  >
      {cartItems.length === 0 ? (
        <h2 className="text-primary text-sm">Nothing To Show...</h2>
      ) : (
        cartItems.map((item) => <CartProduct key={item._id} {...item} />)
      )}
  </div>
</div>



        {/* Footer */}
        <div className="mt-6 border-t pt-4 flex flex-col gap-3">
          <div className="flex justify-between text-base font-semibold">
            <span>Total:</span>
            <span>₹{totalPrice}</span>
          </div>
          <Button onClick={() => navigate("/checkout")} className="w-full">
            Checkout
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
