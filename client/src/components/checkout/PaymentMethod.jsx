import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPaymentMethod } from "@/redux/slices/checkoutSlice";
import { CreditCard, Wallet, Shield, CheckCircle, Lock, AlertCircle } from "lucide-react";

const PaymentMethod = ({ disabled = false }) => {
  const dispatch = useDispatch();
  const { paymentMethod } = useSelector((s) => s.checkout);

  const paymentMethods = [
    {
      id: "RAZORPAY",
      title: "Online Payment",
      description: "Pay using cards, UPI, netbanking & wallets",
      icon: CreditCard,
      features: ["Secure payment", "Instant confirmation", "Multiple options"],
      color: "from-blue-500 to-indigo-600",
      darkColor: "from-blue-600 to-indigo-700",
      bgColor: "bg-blue-50",
      darkBgColor: "dark:bg-blue-900/20",
      borderColor: "border-blue-200",
      darkBorderColor: "dark:border-blue-800/30"
    },
    {
      id: "COD",
      title: "Cash on Delivery",
      description: "Pay when your order is delivered",
      icon: Wallet,
      features: ["No advance payment", "Easy returns", "Pay at doorstep"],
      color: "from-green-500 to-emerald-600",
      darkColor: "from-green-600 to-emerald-700",
      bgColor: "bg-green-50",
      darkBgColor: "dark:bg-green-900/20",
      borderColor: "border-green-200",
      darkBorderColor: "dark:border-green-800/30"
    }
  ];

  const handlePaymentSelect = (methodId) => {
    if (!disabled) {
      dispatch(setPaymentMethod(methodId));
    }
  };

  return (
    <div className={`
      w-full bg-gradient-to-br from-white to-gray-50 
      dark:from-gray-900 dark:to-zinc-900 
      border border-gray-200 dark:border-zinc-800 
      shadow-lg rounded-2xl overflow-hidden
      transition-all duration-300
      ${disabled ? 'opacity-70 cursor-not-allowed' : ''}
    `}>
      
      {/* Disabled Overlay */}
      {disabled && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-4 md:p-6">
          <Lock className="w-10 h-10 md:w-12 md:h-12 text-gray-400 dark:text-gray-600 mb-3 md:mb-4" />
          <h3 className="text-base md:text-lg font-semibold text-gray-700 dark:text-gray-100 mb-1 md:mb-2 text-center">
            Complete Address First
          </h3>
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 text-center mb-3 md:mb-4 max-w-xs">
            Please select a delivery address to proceed with payment
          </p>
          <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-amber-500 dark:text-amber-400 animate-pulse" />
        </div>
      )}

      <div className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 mb-4 md:mb-6 pb-4 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex-shrink-0 p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg w-fit">
            <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate">
              Payment Method
            </h2>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
              Choose how you want to pay
            </p>
          </div>
          
          {/* Mobile Selected Badge */}
          {paymentMethod && (
            <div className="sm:hidden px-2 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-semibold rounded-full">
              Selected
            </div>
          )}
        </div>

        {/* Security Badge */}
        <div className="mb-4 md:mb-6 p-2 md:p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-100 dark:border-green-800/30">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <span className="text-xs md:text-sm font-medium text-green-700 dark:text-green-300 truncate">
              🔒 Secure & Encrypted Payments
            </span>
          </div>
        </div>

        {/* Payment Options */}
        <div className="space-y-3 md:space-y-4">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isSelected = paymentMethod === method.id;

            return (
              <div
                key={method.id}
                onClick={() => handlePaymentSelect(method.id)}
                className={`
                  relative w-full cursor-pointer transition-all duration-300
                  transform hover:scale-[1.01] active:scale-[0.99]
                  ${isSelected
                    ? `ring-2 ring-offset-2 ${method.id === "RAZORPAY" 
                      ? "ring-blue-500 ring-offset-white dark:ring-offset-gray-900" 
                      : "ring-green-500 ring-offset-white dark:ring-offset-gray-900"} shadow-lg`
                    : "hover:shadow-md"
                  }
                  ${disabled ? 'cursor-not-allowed' : ''}
                  rounded-xl overflow-hidden
                `}
              >
                <div className={`
                  p-3 md:p-5 rounded-xl
                `}>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 md:gap-4">
                    {/* Left Section */}
                    <div className="flex items-start gap-3 md:gap-4 flex-1 min-w-0">
                      {/* Selection Indicator */}
                      <div className="mt-0.5 md:mt-1 flex-shrink-0">
                        <div className={`
                          w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center transition-colors
                          ${isSelected
                            ? method.id === "RAZORPAY"
                              ? "border-blue-600 dark:border-blue-400 bg-blue-600 dark:bg-blue-400"
                              : "border-green-600 dark:border-green-400 bg-green-600 dark:bg-green-400"
                            : "border-gray-300 dark:border-zinc-600"
                          }
                          ${disabled ? 'opacity-50' : ''}
                        `}>
                          {isSelected && (
                            <CheckCircle className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col xs:flex-row xs:items-center gap-2 md:gap-3 mb-1 md:mb-2">
                          <div className={`p-1.5 md:p-2 rounded-lg w-fit ${isSelected
                            ? method.id === "RAZORPAY"
                              ? "bg-blue-100 dark:bg-blue-800/40"
                              : "bg-green-100 dark:bg-green-800/40"
                            : "bg-gray-100 dark:bg-zinc-800"
                          }`}>
                            <Icon className={`
                              w-4 h-4 md:w-5 md:h-5
                              ${isSelected
                                ? method.id === "RAZORPAY"
                                  ? "text-blue-600 dark:text-blue-400"
                                  : "text-green-600 dark:text-green-400"
                                : "text-gray-600 dark:text-gray-400"
                              }
                            `} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-3">
                              <h3 className={`
                                font-bold text-base md:text-lg text-gray-900 dark:text-white truncate
                                ${isSelected
                                  ? "text-gray-900 dark:text-white"
                                  : "text-gray-800 dark:text-gray-100"
                                }
                              `}>
                                {method.title}
                              </h3>
                              {/* Mobile Selected Badge */}
                              {isSelected && (
                                <div className={`hidden xs:inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                                  method.id === "RAZORPAY"
                                    ? "bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200"
                                    : "bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200"
                                }`}>
                                  SELECTED
                                </div>
                              )}
                            </div>
                            <p className={`
                              text-xs md:text-sm mt-0.5
                              ${isSelected
                                ? "text-gray-700 dark:text-gray-300"
                                : "text-gray-600 dark:text-gray-300"
                              }
                            `}>
                              {method.description}
                            </p>
                          </div>
                        </div>

                        {/* Features */}
                        <div className="flex flex-wrap gap-1.5 md:gap-2 mt-2 ml-0 xs:ml-8 md:ml-12">
                          {method.features.map((feature, idx) => (
                            <span
                              key={idx}
                              className={`
                                px-2 py-0.5 md:px-2.5 md:py-1 text-xs rounded-full font-medium
                                whitespace-nowrap
                                ${isSelected
                                  ? method.id === "RAZORPAY"
                                    ? "bg-blue-100 dark:bg-blue-800/40 text-blue-700 dark:text-blue-200"
                                    : "bg-green-100 dark:bg-green-800/40 text-green-700 dark:text-green-200"
                                  : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200"
                                }
                              `}
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Desktop Selected Badge */}
                    {isSelected && (
                      <div className={`hidden sm:block px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                        method.id === "RAZORPAY"
                          ? "bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200"
                          : "bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200"
                      }`}>
                        SELECTED
                      </div>
                    )}
                  </div>
                </div>

                {/* Gradient Border Effect */}
                {isSelected && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${method.color} dark:${method.darkColor} opacity-5 pointer-events-none`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Payment Info Footer */}
        <div className="mt-4 md:mt-6 pt-4 md:pt-5 border-t border-gray-100 dark:border-zinc-800">
          <div className="space-y-1.5 md:space-y-2">
            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 dark:text-gray-300">
              <Shield className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
              <span>Your payment details are secure and encrypted</span>
            </div>
            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 dark:text-gray-300">
              <CheckCircle className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
              <span>No extra charges for online payments</span>
            </div>
          </div>
        </div>

        {/* Mobile Action Hint */}
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800 sm:hidden">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            👆 Tap to select payment method
          </p>
        </div>
      </div>

      {/* Disabled Tooltip */}
      {disabled && (
        <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border-t border-amber-200 dark:border-amber-800/30">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Please complete address selection first
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethod;