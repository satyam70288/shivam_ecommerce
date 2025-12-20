// CheckoutPage.jsx में add करें
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { initCheckout } from "@/redux/slices/checkoutSlice";
import AddressSection from "@/components/checkout/AddressSection";
import OrderSummary from "@/components/checkout/OrderSummary";
import PaymentMethod from "@/components/checkout/PaymentMethod";
import PlaceOrderButton from "@/components/checkout/PlaceOrderButton";

const CheckoutPage = () => {
  const dispatch = useDispatch();
  
  // ✅ DEBUG: Check for duplicate buttons
  useEffect(() => {
    console.log("🔍 CheckoutPage mounted");
    
    // Check DOM for duplicate buttons
    setTimeout(() => {
      const buttons = document.querySelectorAll('button');
      const payButtons = Array.from(buttons).filter(btn => 
        btn.textContent.includes('Pay Now') || 
        btn.textContent.includes('Place Order')
      );
      
      console.log(`📊 Found ${payButtons.length} payment buttons:`, 
        payButtons.map(b => ({
          text: b.textContent,
          id: b.id || 'no-id',
          parent: b.parentElement?.className || 'unknown'
        }))
      );
      
      // Highlight all payment buttons
      payButtons.forEach((btn, i) => {
        btn.style.border = `3px solid ${i === 0 ? 'green' : 'red'}`;
        btn.style.margin = '2px';
      });
    }, 100);
    
  }, []);
  
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
        {/* ✅ Ensure only ONE PlaceOrderButton */}
        <PlaceOrderButton />
        
        {/* ❌ NO OTHER BUTTONS HERE */}
      </div>
    </div>
  );
};

export default CheckoutPage;