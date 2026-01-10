// PlaceOrderButton.jsx - FINAL WORKING VERSION
import React, { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import useRazorpay from "@/hooks/use-razorpay";
import { useToast } from "@/hooks/use-toast";
import { createRazorpayOrder, placeCodOrder } from "@/redux/slices/checkoutSlice";

const PlaceOrderButton = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  
  // ✅ Make sure hook returns openRazorpayModal
  const { openRazorpayModal } = useRazorpay();
  
 
  
  const isProcessing = useRef(false);

  const {
    paymentMethod,
    addressId,
    productId,
    qty,
    loading,
  } = useSelector((s) => s.checkout);

  const handlePlaceOrder = async () => {
    if (isProcessing.current) {
   
      return;
    }
    
    if (!addressId) {
      toast({ 
        title: "Please select an address",
        variant: "destructive" 
      });
      return;
    }

    // ✅ Check if openRazorpayModal exists
    if (paymentMethod === "RAZORPAY" && !openRazorpayModal) {
      console.error("❌ openRazorpayModal is not defined!");
      toast({
        title: "Payment system error",
        description: "Please refresh the page",
        variant: "destructive"
      });
      return;
    }

    isProcessing.current = true;
    
    try {
      /* =========================
         COD FLOW
      ========================= */
      if (paymentMethod === "COD") {
        await dispatch(placeCodOrder()).unwrap();
        
        toast({ 
          title: "COD Order placed successfully!",
          description: "You will pay on delivery"
        });
        
        setTimeout(() => {
          window.location.href = "/orders";
        }, 1500);
        return;
      }

      /* =========================
         RAZORPAY FLOW
      ========================= */
      if (paymentMethod === "RAZORPAY") {
        // Step 1: Create Razorpay order via Redux
        const result = await dispatch(createRazorpayOrder()).unwrap();

        
        // Step 2: Get user details
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        
        // Step 3: Open Razorpay modal
        await openRazorpayModal({
          razorpayOrderId: result.razorpayOrderId,
          amount: result.amount,
          key: result.key,
          userDetails: {
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
            addressId: addressId,      // Pass for verification
            productId: productId,
            quantity: qty || 1
          },
          onSuccess: (orderId) => {
            window.location.href = `/orders`;
          },
          onFailure: (error) => {
            toast({
              title: "Payment failed",
              description: error.message || "Please try again",
              variant: "destructive"
            });
          }
        });
      }

    } catch (err) {
      console.error("❌ Place Order Error:", err);
      toast({ 
        title: typeof err === "string" ? err : "Failed to place order",
        variant: "destructive" 
      });
    } finally {
      setTimeout(() => {
        isProcessing.current = false;
      }, 2000);
    }
  };

  return (
    <Button
      className="w-full h-12 text-lg"
      disabled={loading || !addressId || isProcessing.current}
      onClick={handlePlaceOrder}
    >
      {loading ? "Processing..." : paymentMethod === "COD" ? "Place Order" : "Pay Now"}
    </Button>
  );
};

export default PlaceOrderButton;