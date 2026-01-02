import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPaymentMethod } from "@/redux/slices/checkoutSlice";
import { CreditCard, Wallet, Shield, Check } from "lucide-react";

const PaymentMethod = ({ disabled = false }) => {
  const dispatch = useDispatch();
  const { paymentMethod } = useSelector((s) => s.checkout);

  const methods = [
    {
      id: "RAZORPAY",
      title: "Online Payment",
      desc: "Cards, UPI, netbanking & wallets",
      icon: CreditCard,
      color: "blue",
    },
    {
      id: "COD",
      title: "Cash on Delivery",
      desc: "Pay when order is delivered",
      icon: Wallet,
      color: "green",
    },
  ];

  const handleSelect = (id) => {
    if (!disabled) dispatch(setPaymentMethod(id));
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Select Payment Method
        </h2>
      </div>

      <div className="space-y-3">
        {methods.map((method) => {
          const isSelected = paymentMethod === method.id;

          return (
            <button
              key={method.id}
              onClick={() => handleSelect(method.id)}
              disabled={disabled}
              className={`
    w-full flex items-center gap-4 p-4 border rounded-lg text-left
    transition-colors relative
    ${
      isSelected
        ? method.color === "blue"
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
          : "border-green-500 bg-green-50 dark:bg-green-900/20"
        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
    }
    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
  `}
            >
              {/* Checkmark को यहाँ ले आओ */}
              <div className="flex-shrink-0">
                <div
                  className={`
      w-5 h-5 rounded-full border-2 flex items-center justify-center
      ${
        isSelected
          ? method.color === "blue"
            ? "border-blue-500 bg-blue-500"
            : "border-green-500 bg-green-500"
          : "border-gray-300 dark:border-gray-600"
      }
    `}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
              </div>

              <div
                className={`p-2 rounded-lg ${
                  isSelected
                    ? method.color === "blue"
                      ? "bg-blue-100 dark:bg-blue-800"
                      : "bg-green-100 dark:bg-green-800"
                    : "bg-gray-100 dark:bg-gray-800"
                }`}
              >
                <method.icon
                  className={`w-5 h-5 ${
                    isSelected
                      ? method.color === "blue"
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-green-600 dark:text-green-400"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {method.title}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {method.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 pt-3 border-t">
        <Shield className="w-4 h-4 flex-shrink-0" />
        <span>100% secure payments</span>
      </div>
    </div>
  );
};

export default PaymentMethod;
