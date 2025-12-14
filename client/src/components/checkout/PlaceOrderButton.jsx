import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { placeOrder } from "@/redux/slices/checkoutSlice";
import { Button } from "@/components/ui/button";
import useRazorpay from "@/hooks/use-razorpay";
import { useToast } from "@/hooks/use-toast";

const PlaceOrderButton = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { openRazorpay } = useRazorpay();

  const {
    paymentMethod,
    addressId,
    order,
    loading,
  } = useSelector((s) => s.checkout);

  const handlePlaceOrder = async () => {
    if (!addressId) {
      toast({ title: "Please select address" });
      return;
    }

    try {
      const res = await dispatch(placeOrder()).unwrap();

      /* =========================
         COD FLOW
      ========================= */
      if (paymentMethod === "COD") {
        toast({ title: "Order placed successfully" });
        // redirect to orders page
        window.location.href = "/orders";
        return;
      }

      /* =========================
         ONLINE FLOW
      ========================= */
      if (paymentMethod === "ONLINE") {
        openRazorpay({
          orderId: res.razorpayOrder.id,
          amount: res.razorpayOrder.amount,
          onSuccess: () => {
            window.location.href = "/orders";
          },
        });
      }

    } catch (err) {
      toast({ title: err });
    }
  };

  return (
    <Button
      className="w-full h-12 text-lg"
      disabled={loading}
      onClick={handlePlaceOrder}
    >
      {paymentMethod === "COD" ? "Place Order" : "Pay Now"}
    </Button>
  );
};

export default PlaceOrderButton;
