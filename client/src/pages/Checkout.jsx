// checkout/CheckoutPage.jsx
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { initCheckout } from "@/redux/slices/checkoutSlice";
import AddressSection from "@/components/checkout/AddressSection";
import OrderSummary from "@/components/checkout/OrderSummary";
import PaymentMethod from "@/components/checkout/PaymentMethod";
import PlaceOrderButton from "@/components/checkout/PlaceOrderButton";

const CheckoutPage = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const productId = params.get("productId");
    const qty = params.get("qty");

    dispatch(initCheckout({ productId, qty }));
  }, [dispatch, location.search]);

  return (
    <div className="mx-auto w-[90%] lg:w-[80%] my-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <AddressSection />
        <OrderSummary />
        <PaymentMethod />
      </div>

      <div>
        <PlaceOrderButton />
      </div>
    </div>
  );
};

export default CheckoutPage;
