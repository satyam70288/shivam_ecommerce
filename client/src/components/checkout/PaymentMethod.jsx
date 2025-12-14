// checkout/PaymentMethod.jsx
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPaymentMethod } from "@/redux/slices/checkoutSlice";
import { Card } from "@/components/ui/card";

const PaymentMethod = () => {
  const dispatch = useDispatch();
  const { paymentMethod } = useSelector((s) => s.checkout);

  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-3">Payment Method</h2>

      <label className="flex gap-2 mb-2">
        <input
          type="radio"
          checked={paymentMethod === "COD"}
          onChange={() => dispatch(setPaymentMethod("COD"))}
        />
        Cash on Delivery
      </label>

      <label className="flex gap-2">
        <input
          type="radio"
          checked={paymentMethod === "online"}
          onChange={() => dispatch(setPaymentMethod("online"))}
        />
        Online Payment
      </label>
    </Card>
  );
};

export default PaymentMethod;
