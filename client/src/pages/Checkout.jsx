import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { initCheckout, setProductId } from "@/redux/slices/checkoutSlice";
import AddressSection from "@/components/checkout/AddressSection";
import OrderSummary from "@/components/checkout/OrderSummary";
import PaymentMethod from "@/components/checkout/PaymentMethod";
import PlaceOrderButton from "@/components/checkout/PlaceOrderButton";
import {
  ArrowLeft,
  ShoppingBag,
  Shield,
  MapPin,
  Package,
  CreditCard,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState("address");

  const {
    addressId,
    paymentMethod,
    items = [],
    addresses = [],
    summary, // ✅ summary data available ha
  } = useSelector((s) => s.checkout);
  // ✅ USE summary data instead
  const subtotal = summary?.subtotal || 0;
  const discount = summary?.discount || 0;
  const shipping = summary?.shipping || 0;
  const tax = summary?.tax || 0;
  const total = summary?.total || 0;
  const selectedAddress = addresses.find((addr) => addr._id === addressId);

  // Step flow
  // useEffect(() => {
  //   if (addressId && currentStep === "address") {
  //     setCurrentStep("summary");
  //   }
  // }, [addressId, currentStep]);

  // Load checkout data
  // CheckoutPage.jsx में useEffect update करें
useEffect(() => {
  if (!addressId) return;
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("productId");
  const qty = params.get("qty");
  
  dispatch(setProductId(productId));
  
  // Address के साथ calculation call करें
  if (addressId) {
    const selectedAddress = addresses.find(addr => addr._id === addressId);
    dispatch(initCheckout({ 
      productId, 
      qty, 
      addressId,
      address: selectedAddress 
    }));
  } else {
    dispatch(initCheckout({ 
      addressId,
      address: selectedAddress,
      checkoutType: "CART"  // ✅ YEH IMPORTANT LINE HAI
    }));
  }
}, [dispatch, addressId, addresses]); // ✅ addresses dependency add की

  // Calculate total
  const getTotalAmount = () => {
    return items.reduce((sum, item) => sum + (item.lineTotal || 0), 0);
  };

  // Back button handler
  const handleBack = () => {
    if (currentStep === "summary") {
      setCurrentStep("address");
    } else if (currentStep === "payment") {
      setCurrentStep("summary");
    } else {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate("/");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className="flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                Checkout
              </h1>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="hidden sm:inline text-gray-600 dark:text-gray-400">
                100% Secure
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-center gap-8 mb-6">
          {[
            { id: "address", label: "Address", icon: MapPin },
            { id: "summary", label: "Summary", icon: Package },
            { id: "payment", label: "Payment", icon: CreditCard },
          ].map((step, index) => {
            const isActive = currentStep === step.id;
            const isCompleted =
              (step.id === "address" && addressId) ||
              (step.id === "summary" && addressId);

            return (
              <div key={step.id} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${
                    isCompleted
                      ? "bg-blue-600 text-white"
                      : isActive
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-2 border-blue-500"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                  }`}
                >
                  {index + 1}
                </div>
                <span
                  className={`text-sm font-medium hidden sm:inline ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500"
                  }`}
                >
                  {step.label}
                </span>

                {index < 2 && (
                  <div
                    className={`w-12 h-0.5 ${
                      step.id === "address" && addressId
                        ? "bg-blue-500"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 pb-20 lg:pb-10">
        {/* Step 1: Address Selection */}
        {currentStep === "address" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Select Delivery Address
              </h2>
              <AddressSection />
            </div>

            {addressId && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <button
                  onClick={() => setCurrentStep("summary")}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition"
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Order Summary */}
        {currentStep === "summary" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column - Address & Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Selected Address */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Delivery Address
                  </h2>
                  <button
                    onClick={() => setCurrentStep("address")}
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                  >
                    Change
                  </button>
                </div>

                {selectedAddress && (
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedAddress.name}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedAddress.address_line1}
                      {selectedAddress.address_line2 &&
                        `, ${selectedAddress.address_line2}`}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedAddress.city}, {selectedAddress.state} -{" "}
                      {selectedAddress.pincode}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Phone: {selectedAddress.phone}
                    </p>
                  </div>
                )}
              </div>

              {/* Order Summary Component */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Order Summary
                </h2>
                <OrderSummary />
              </div>
            </div>

            {/* Right Column - Price Summary & Continue Button */}
            <div className="lg:sticky lg:top-6 self-start">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Price Details
                  </h3>
                </div>

                <div className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Total MRP
                      </span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Discount
                        </span>
                        <span className="text-green-600 dark:text-green-400">
                          -₹{discount.toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Delivery Charges
                      </span>
                      <span className="text-green-600 dark:text-green-400">
                        {shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}
                      </span>
                    </div>

                    {tax > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Tax (18%)
                        </span>
                        <span>₹{tax.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Total Amount
                      </span>
                      <span className="text-xl font-bold text-gray-900 dark:text-white">
                        ₹{total.toFixed(2)}
                      </span>
                    </div>
                    {discount > 0 && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        You will save ₹{discount.toFixed(2)} on this order
                      </p>
                    )}
                  </div>
                </div>

                {/* Continue to Payment Button */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <button
                    onClick={() => setCurrentStep("payment")}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {currentStep === "payment" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column - Payment Section (SAME) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header Card (SAME) */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Select Payment Method
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Choose your preferred payment option
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentStep("summary")}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    ← Back to Summary
                  </button>
                </div>

                {/* Address Preview Card (SAME) */}
                {selectedAddress && (
                  <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-400 text-sm">
                              📍
                            </span>
                          </div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            Delivery Address
                          </h3>
                        </div>
                        <div className="ml-10 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {selectedAddress.name}
                            </span>
                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded">
                              Primary
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400">
                            {selectedAddress.address_line1}
                            {selectedAddress.address_line2 &&
                              `, ${selectedAddress.address_line2}`}
                          </p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1">
                            <span className="text-gray-600 dark:text-gray-400">
                              {selectedAddress.city}, {selectedAddress.state}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              Pincode: {selectedAddress.pincode}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              Phone: {selectedAddress.phone}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setCurrentStep("address")}
                        className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                )}

                {/* Payment Methods (SAME) */}
                <div className="p-6">
                  <PaymentMethod />
                </div>
              </div>

              {/* Security Badge (SAME) */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-200 dark:border-green-800/30 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 dark:text-green-400 text-lg">
                      🔒
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                      100% Secure Payments
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      Your payment information is encrypted and secure
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary (UPDATED) */}
            <div className="lg:sticky lg:top-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Header */}
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 text-sm">
                        📦
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      Order Summary
                    </h3>
                  </div>
                </div>

                {/* Items List (SAME) */}
                <div className="px-5 py-4">
                  <div className="space-y-4">
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                      {items.map((item) => (
                        <div
                          key={item.productId}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <div className="relative">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-14 h-14 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                            />
                            {item.quantity > 1 && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                                {item.quantity}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                              {item.name}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                                Qty: {item.quantity}
                              </span>
                              {item.discountAmount > 0 && (
                                <span className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">
                                  Save ₹{item.discountAmount.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              ₹{(item.lineTotal || 0).toFixed(2)}
                            </p>
                            {item.discountAmount > 0 && (
                              <p className="text-xs text-gray-400 line-through">
                                ₹{(item.price * item.quantity).toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Price Breakdown (UPDATED) */}
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">
                            Subtotal
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            ₹{subtotal.toFixed(2)}
                          </span>
                        </div>

                        {discount > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">
                              Discount
                            </span>
                            <span className="font-medium text-green-600 dark:text-green-400">
                              -₹{discount.toFixed(2)}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">
                            Shipping
                          </span>
                          <span className="font-medium text-green-600 dark:text-green-400">
                            {shipping === 0
                              ? "FREE"
                              : `₹${shipping.toFixed(2)}`}
                          </span>
                        </div>

                        {tax > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">
                              Taxes
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              ₹{tax.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total (UPDATED) */}
                <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/10 dark:to-blue-900/20">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">
                        Total Amount
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Inclusive of all taxes
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        ₹{total.toFixed(2)}
                      </p>
                      {discount > 0 && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                          You save ₹{discount.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Place Order Button (SAME) */}
                <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-700">
                  <PlaceOrderButton />

                  {/* Payment Security Note (SAME) */}
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="text-green-500">✓</span>
                    <span>Secure payment • 256-bit SSL encryption</span>
                  </div>
                </div>
              </div>

              {/* Help Card (SAME) */}
              <div className="mt-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 dark:text-purple-400 text-sm">
                      ❓
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                      Need help with payment?
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Contact our support team for assistance
                    </p>
                    <button className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-2">
                      Get Help →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Bar */}
      {currentStep !== "payment" && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Total: ₹{getTotalAmount().toFixed(2)}
              </p>
              {currentStep === "summary" && selectedAddress && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  To: {selectedAddress.name}
                </p>
              )}
            </div>

            <div>
              {currentStep === "address" && addressId ? (
                <button
                  onClick={() => setCurrentStep("summary")}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow"
                >
                  Continue
                </button>
              ) : currentStep === "summary" ? (
                <button
                  onClick={() => setCurrentStep("payment")}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow"
                >
                  Continue to Payment
                </button>
              ) : currentStep === "address" ? (
                <button
                  disabled
                  className="px-6 py-2 bg-gray-300 dark:bg-gray-700 text-gray-500 font-medium rounded-lg cursor-not-allowed"
                >
                  Select Address
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
