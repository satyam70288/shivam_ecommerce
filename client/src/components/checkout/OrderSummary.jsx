// checkout/OrderSummary.jsx
import React from "react";
import { Card } from "@/components/ui/card";

import Items from "./Items"
import CouponInput from "./CouponInput";
import PriceBreakup from "./PriceBreakup";

const OrderSummary = () => {
  return (
    <Card className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">Order Summary</h2>

      <Items />
      {/* <CouponInput /> */}
      <PriceBreakup />
    </Card>
  );
};

export default OrderSummary;
