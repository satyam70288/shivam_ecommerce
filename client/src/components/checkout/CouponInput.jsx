// checkout/CouponInput.jsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";

import { applyCoupon } from "@/redux/slices/checkoutSlice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const CouponInput = () => {
  const dispatch = useDispatch();
  const [code, setCode] = useState("");

  const handleApply = () => {
    if (!code.trim()) return;
    dispatch(applyCoupon(code));
  };

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Enter coupon code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <Button onClick={handleApply}>Apply</Button>
    </div>
  );
};

export default CouponInput;
