// src/components/custom/OrderData/OrderActions.jsx
import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getActionButtons, buttonVariantClasses } from "@/utils/orderHelpers";

const ActionButton = ({ button }) => (
  <button
    onClick={button.onClick}
    disabled={button.disabled}
    className={`px-5 py-3 font-semibold rounded-xl transition-all duration-200 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 flex-1 min-w-[140px] ${
      buttonVariantClasses[button.variant]
    }`}
  >
    {button.icon}
    {button.label}
  </button>
);

const OrderActions = ({
  status,
  loading,
  showActions,
  setShowActions,
  handleTrackOrder,
  handleCancelClick,
}) => {
  const actionButtons = getActionButtons({
    status,
    loading,
    handleTrackOrder,
    handleCancelClick,
  });

  return (
    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
      <div
        className="flex items-center justify-between cursor-pointer md:cursor-default"
        onClick={() => window.innerWidth < 768 && setShowActions(!showActions)}
      >
        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
          Order Actions
        </h3>

        <button className="md:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
          {showActions ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className={`${showActions ? "block" : "hidden md:block"} mt-4 md:mt-0`}>
        <div className="flex flex-wrap gap-3">
          {actionButtons.map((button, idx) => (
            <ActionButton key={idx} button={button} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderActions;