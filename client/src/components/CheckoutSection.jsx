// components/custom/CheckoutSection.jsx

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import useRazorpay from "@/hooks/use-razorpay";

const CheckoutSection = ({
  product,
  quantity,
  color,
  size,
  onComplete = () => {},
}) => {
  const { toast } = useToast();
  const { generatePayment, verifyPayment } = useRazorpay();

  const [address, setAddress] = useState("");
  const [paymentMode, setPaymentMode] = useState("Razorpay");
  const [loading, setLoading] = useState(false);

  const handleConfirmOrder = async () => {
    if (!address.trim()) {
      toast({ title: "Please enter your address" });
      return;
    }

    const orderData = {
      amount: product.price * quantity,
      address,
      products: [
        {
          id: product._id,
          quantity,
          color,
          size,
        },
      ],
    };

    try {
      setLoading(true);

      if (paymentMode === "COD") {

       const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/create-cod-order`,
          orderPayload,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
   
        toast({ title: "COD Order Placed Successfully" });
        onComplete();
      } else {
        // Razorpay order
        const order = await generatePayment(orderData.amount);

        await verifyPayment(order, orderData.products, address);
        onComplete();
      }
    } catch (err) {
      toast({ title: err?.response?.data?.message || "Order failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-2 space-y-4">
      <Input
        placeholder="Enter Your Address Here..."
        onChange={(e) => setAddress(e.target.value)}
        disabled={loading}
      />

      <div className="space-y-2">
        <label className="font-medium">Select Payment Method:</label>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="paymentMode"
              value="Razorpay"
              checked={paymentMode === "Razorpay"}
              onChange={() => setPaymentMode("Razorpay")}
              disabled={loading}
            />
            Online
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="paymentMode"
              value="COD"
              checked={paymentMode === "COD"}
              onChange={() => setPaymentMode("COD")}
              disabled={loading}
            />
            Cash on Delivery
          </label>
        </div>
      </div>
      
      <Button onClick={handleConfirmOrder} disabled={loading}>
        {loading ? "Processing..." : "Confirm Order"}
      </Button>
    </div>
  );
};

export default CheckoutSection;
