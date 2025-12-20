// hooks/use-razorpay.js
import { useDispatch } from "react-redux";
import { useToast } from "./use-toast";
import { verifyRazorpayPayment } from "@/redux/slices/checkoutSlice";

const useRazorpay = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();

  /* =========================
     LOAD RAZORPAY SCRIPT
  ========================= */
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  /* =========================
     OPEN RAZORPAY MODAL
  ========================= */
  const openRazorpayModal = async ({
    razorpayOrderId,
    amount,
    key,
    userDetails = {},
    onSuccess,
    onFailure,
  }) => {
    try {
      // 1️⃣ Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast({
          title: "Payment gateway failed to load",
          variant: "destructive",
        });
        return;
      }

      // 2️⃣ Razorpay options
      const options = {
        key: key || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency: "INR",
        name: "Your Store",
        description: "Order Payment",
        order_id: razorpayOrderId,

        prefill: {
          name: userDetails.name || "",
          email: userDetails.email || "",
          contact: userDetails.phone || "",
        },

        theme: {
          color: "#3399cc",
        },

        /* =========================
           PAYMENT SUCCESS HANDLER
        ========================= */
        handler: async (response) => {
          try {
            const resultAction = await dispatch(
              verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              })
            );

            if (verifyRazorpayPayment.fulfilled.match(resultAction)) {
              toast({
                title: "Payment Successful!",
                description: "Your order has been placed.",
              });

              if (onSuccess) {
                onSuccess(resultAction.payload.orderId);
              }
            } else {
              throw new Error(
                resultAction.payload || "Payment verification failed"
              );
            }
          } catch (error) {
            console.error("Payment verification error:", error);

            if (onFailure) onFailure(error);

            toast({
              title: "Payment verification failed",
              description: error.message || "Please contact support",
              variant: "destructive",
            });
          }
        },

        /* =========================
           MODAL CLOSE HANDLER
        ========================= */
        modal: {
          ondismiss: () => {
            toast({
              title: "Payment cancelled",
              description: "You can try again",
            });
          },
        },
      };

      // 3️⃣ Open Razorpay modal
      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();

      return razorpayInstance;
    } catch (error) {
      console.error("Open Razorpay Error:", error);
      toast({
        title: "Failed to open payment",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return { openRazorpayModal };
};

export default useRazorpay;
