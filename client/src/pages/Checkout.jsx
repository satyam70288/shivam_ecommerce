import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { initCheckout } from "@/redux/slices/checkoutSlice";
import AddressSection from "@/components/checkout/AddressSection";
import OrderSummary from "@/components/checkout/OrderSummary";
import PaymentMethod from "@/components/checkout/PaymentMethod";
import PlaceOrderButton from "@/components/checkout/PlaceOrderButton";
import ProgressBar from "@/components/checkout/ProgressBar";
import {
  ShoppingBag,
  Shield,
  Menu,
  X
} from "lucide-react";

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState(1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Redux state
  const {
    addresses = [],
    addressId,
    paymentMethod,
    items,
  } = useSelector((s) => s.checkout);

  useEffect(() => {
    if (addressId && currentStep === 1) {
      setCurrentStep(2);
    }
  }, [addressId, currentStep]);

  useEffect(() => {
    if (paymentMethod && currentStep === 2) {
      setCurrentStep(3);
    }
  }, [paymentMethod, currentStep]);

  // Load checkout data
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("productId");
    const qty = params.get("qty");
    dispatch(initCheckout({ productId, qty }));
  }, [dispatch]);

  const handleStepChange = (step) => {
    setCurrentStep(step);
    setIsMobileMenuOpen(false); // Close mobile menu on step change
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-zinc-800 shadow-sm py-4">
        <div className="px-4 mx-auto">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
            
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Checkout
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full border border-green-100 dark:border-green-800/30">
                <span className="text-xs font-medium text-green-700 dark:text-green-300">
                  Step {currentStep}/3
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed top-16 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-zinc-800 shadow-lg">
          <div className="px-4 py-3">
            <div className="space-y-2">
              <button
                onClick={() => handleStepChange(1)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                  currentStep === 1
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    currentStep === 1
                      ? 'bg-blue-100 dark:bg-blue-800'
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    <div className="w-4 h-4 flex items-center justify-center">
                      1
                    </div>
                  </div>
                  <div className="text-left">
                    <div className={`font-medium ${
                      currentStep === 1
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      Address
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Delivery address
                    </div>
                  </div>
                </div>
                {currentStep === 1 && (
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                )}
              </button>

              <button
                onClick={() => addressId && handleStepChange(2)}
                disabled={!addressId}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                  currentStep === 2
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                    : addressId
                    ? 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    currentStep === 2
                      ? 'bg-blue-100 dark:bg-blue-800'
                      : addressId
                      ? 'bg-gray-100 dark:bg-gray-800'
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    <div className="w-4 h-4 flex items-center justify-center">
                      2
                    </div>
                  </div>
                  <div className="text-left">
                    <div className={`font-medium ${
                      currentStep === 2
                        ? 'text-blue-700 dark:text-blue-300'
                        : addressId
                        ? 'text-gray-700 dark:text-gray-300'
                        : 'text-gray-500 dark:text-gray-500'
                    }`}>
                      Payment
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Payment method
                    </div>
                  </div>
                </div>
                {!addressId && (
                  <div className="text-xs text-gray-400">Select address first</div>
                )}
                {currentStep === 2 && (
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                )}
              </button>

              <button
                onClick={() => addressId && paymentMethod && handleStepChange(3)}
                disabled={!(addressId && paymentMethod)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                  currentStep === 3
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                    : addressId && paymentMethod
                    ? 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    currentStep === 3
                      ? 'bg-blue-100 dark:bg-blue-800'
                      : addressId && paymentMethod
                      ? 'bg-gray-100 dark:bg-gray-800'
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    <div className="w-4 h-4 flex items-center justify-center">
                      3
                    </div>
                  </div>
                  <div className="text-left">
                    <div className={`font-medium ${
                      currentStep === 3
                        ? 'text-blue-700 dark:text-blue-300'
                        : addressId && paymentMethod
                        ? 'text-gray-700 dark:text-gray-300'
                        : 'text-gray-500 dark:text-gray-500'
                    }`}>
                      Review
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Place order
                    </div>
                  </div>
                </div>
                {!(addressId && paymentMethod) && (
                  <div className="text-xs text-gray-400">
                    {!addressId ? 'Select address' : 'Select payment'}
                  </div>
                )}
                {currentStep === 3 && (
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content with padding for mobile header */}
      <div className="pt-16 lg:pt-0">
        {/* Desktop Header */}
        <div className="hidden lg:block bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <ShoppingBag className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    Checkout
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Complete your purchase in few steps
                  </p>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-100 dark:border-green-800/30">
                <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  🔒 Secure Checkout
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar Component */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <ProgressBar
            currentStep={currentStep}
            totalSteps={3}
            onStepChange={handleStepChange}
            showProgress={true}
            addressSelected={!!addressId}
            paymentSelected={!!paymentMethod}
          />
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6 lg:space-y-8">
              {/* Step 1: Address Section */}
              <div
                className={`
                transition-all duration-500 rounded-2xl overflow-hidden
                ${currentStep === 1 ? "opacity-100" : "opacity-70"}
              `}
              >
                <AddressSection />
              </div>

              {/* Step 2: Payment Method */}
              <div
                className={`
                transition-all duration-500 rounded-2xl overflow-hidden
                ${currentStep === 2 ? "opacity-100" : "opacity-70"}
                ${!addressId ? "relative" : ""}
              `}
              >
                {!addressId && (
                  <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm z-10 rounded-2xl flex flex-col items-center justify-center p-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Address Required
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Please select a delivery address first
                      </p>
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all text-sm"
                      >
                        Go to Address
                      </button>
                    </div>
                  </div>
                )}
                <PaymentMethod disabled={!addressId} />
              </div>

              {/* Mobile Step Indicator */}
              
            </div>

            {/* Right Column - Order Summary */}
            <div className="space-y-6">
              <OrderSummary />

              {/* Place Order Card */}
              <div className="lg:sticky lg:top-6">
                <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-zinc-900 rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-800 p-4">
                  {/* Requirements Checklist */}
                  <div className="space-y-3 mb-6">
                    <div
                      className={`flex items-center gap-2 ${
                        addressId
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          addressId
                            ? "bg-green-500 text-white"
                            : "border border-gray-300"
                        }`}
                      >
                        {addressId ? "✓" : ""}
                      </div>
                      <span className="text-sm">Delivery Address</span>
                    </div>

                    <div
                      className={`flex items-center gap-2 ${
                        paymentMethod
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          paymentMethod
                            ? "bg-green-500 text-white"
                            : "border border-gray-300"
                        }`}
                      >
                        {paymentMethod ? "✓" : ""}
                      </div>
                      <span className="text-sm">Payment Method</span>
                    </div>
                  </div>

                  {/* Place Order Button */}
                  {currentStep === 3 ? (
                    <div className="space-y-4">
                      <PlaceOrderButton />
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        if (!addressId) {
                          setCurrentStep(1);
                        } else if (!paymentMethod) {
                          setCurrentStep(2);
                        }
                      }}
                      className="w-full py-3 bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 font-semibold rounded-lg cursor-not-allowed text-sm"
                      disabled
                    >
                      Complete Steps 1 & 2 to Place Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;