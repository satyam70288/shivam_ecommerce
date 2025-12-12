import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { emptyCart } from "@/redux/slices/cartSlice";
import useErrorLogout from "@/hooks/use-error-logout";
import useRazorpay from "@/hooks/use-razorpay";
import { useToast } from "@/hooks/use-toast";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { handleErrorLogout } = useErrorLogout();
  const { generatePayment, verifyPayment } = useRazorpay();

  const { cartItems } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  // If coming from Buy Now → use products from state
  const stateProducts = location.state?.products || [];
  const products = stateProducts.length ? stateProducts : cartItems;

  const computedTotal = products.reduce(
    (sum, p) => sum + (p.price || 0) * (p.quantity || 1),
    0
  );

  // Address State
  const [address, setAddress] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    street: "",
    area: "",
    landmark: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
  });

  // ✅ Payment method
  const [paymentMethod, setPaymentMethod] = useState("cod"); // "cod" | "online"

  const handlePlaceOrder = async () => {
    // Address validation
    for (let key of ["name", "email", "phone", "street", "city", "state", "zip"]) {
      if (!address[key]?.trim()) {
        toast({ title: `Please fill ${key}`, variant: "destructive" });
        return;
      }
    }

    if (!products.length) {
      toast({ title: "No products to checkout", variant: "destructive" });
      return;
    }

    try {
      const orderProducts = products.map((item) => ({
        id: item.productId || item.id || item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        color: item.color || "",
        size: item.size || "",
        image: item.image || "/fallback.png",
      }));

      // ✅ ONLINE PAYMENT (RAZORPAY)
      if (paymentMethod === "online") {
        const amountInPaise = computedTotal * 100;
        const order = await generatePayment(amountInPaise);

        await verifyPayment(order, orderProducts, address);

        if (!stateProducts.length) dispatch(emptyCart());

        toast({ title: "Payment successful!" });
        navigate("/my-orders");
        return;
      }

      // ✅ CASH ON DELIVERY
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/cod-order`,
        {
          amount: computedTotal,
          address,
          products: orderProducts,
          paymentMode: "cod",
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!res.data.success) {
        toast({
          title: res.data.message || "COD order failed",
          variant: "destructive",
        });
        return;
      }

      if (!stateProducts.length) dispatch(emptyCart());

      toast({ title: "Order placed with Cash on Delivery!" });
      navigate("/my-orders");
    } catch (err) {
      handleErrorLogout(err);
    }
  };

  return (
    <div className="mx-auto w-[95vw] lg:w-[80vw] flex flex-col sm:flex-row gap-6 my-10">

      {/* LEFT - ORDER SUMMARY */}
      <div className="flex-1">
        <Card className="p-4 shadow-md space-y-4">
          <h2 className="text-xl font-semibold">Order Summary</h2>

          {products.length === 0 ? (
            <p className="text-red-500">Your cart is empty.</p>
          ) : (
            products.map((item) => (
              <div
                key={item._id}
                className="flex justify-between items-center border rounded-md p-2"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p>Qty: {item.quantity}</p>
                    {item.color && <p>Color: {item.color}</p>}
                    {item.size && <p>Size: {item.size}</p>}
                  </div>
                </div>
                <p className="font-bold">₹{item.price * item.quantity}</p>
              </div>
            ))
          )}

          <hr />
          <p className="flex justify-between font-bold">
            <span>Total</span>
            <span>₹{computedTotal}</span>
          </p>
        </Card>
      </div>

      {/* RIGHT - BILLING + PAYMENT */}
      <div className="w-full sm:w-[360px]">
        <Card className="p-4 shadow-md space-y-4">
          <h2 className="text-xl font-semibold">Billing Information</h2>

          <div className="grid gap-3">
            {[
              { key: "name", label: "Full Name" },
              { key: "email", label: "Email" },
              { key: "phone", label: "Mobile Number" },
              { key: "street", label: "Flat / House No." },
              { key: "area", label: "Area / Street" },
              { key: "landmark", label: "Landmark" },
              { key: "city", label: "City" },
              { key: "state", label: "State" },
              { key: "zip", label: "PIN Code" },
              { key: "country", label: "Country" },
            ].map((f) => (
              <Input
                key={f.key}
                placeholder={f.label}
                value={address[f.key]}
                onChange={(e) =>
                  setAddress({ ...address, [f.key]: e.target.value })
                }
              />
            ))}
          </div>

          {/* ✅ PAYMENT METHOD */}
          <div className="space-y-2">
            <Label className="font-semibold">Payment Method</Label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
              />
              Cash on Delivery
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={paymentMethod === "online"}
                onChange={() => setPaymentMethod("online")}
              />
              Online Payment (Razorpay)
            </label>
          </div>

          <Button
            onClick={handlePlaceOrder}
            className="w-full mt-4"
            disabled={!products.length}
          >
            {paymentMethod === "online" ? "Pay Now" : "Confirm Order"}
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Checkout;
