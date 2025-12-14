// checkout/PriceBreakup.jsx
import React from "react";
import { useSelector } from "react-redux";

const PriceBreakup = () => {
  const { summary } = useSelector((s) => s.checkout);

  return (
    <div className="border-t pt-3 space-y-1 text-sm">
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>₹{summary.subtotal}</span>
      </div>

      <div className="flex justify-between text-green-600">
        <span>Discount</span>
        <span>-₹{summary.discount}</span>
      </div>

      <div className="flex justify-between">
        <span>Shipping</span>
        <span>₹{summary.shipping}</span>
      </div>

      <div className="flex justify-between font-bold text-base">
        <span>Total</span>
        <span>₹{summary.total}</span>
      </div>
    </div>
  );
};

export default PriceBreakup;
