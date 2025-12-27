// src/utils/orderHelpers.js
import { 
  Truck, MessageCircle, ExternalLink, XCircle, 
  Star, RotateCw, HelpCircle, Package, 
  CheckCircle, Clock, IndianRupee, Calendar 
} from "lucide-react";

// Status icon getter
export const getStatusIcon = (status) => {
  switch(status) {
    case "PLACED": return <Package className="w-4 h-4" />;
    case "CONFIRMED": return <CheckCircle className="w-4 h-4" />;
    case "PACKED": return <Package className="w-4 h-4" />;
    case "SHIPPED": return <Truck className="w-4 h-4" />;
    case "DELIVERED": return <CheckCircle className="w-4 h-4" />;
    default: return <Clock className="w-4 h-4" />;
  }
};

// Status color classes getter
export const getStatusColor = (status) => {
  const colors = {
    PLACED: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700",
    CONFIRMED: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700",
    PACKED: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700",
    SHIPPED: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700",
    DELIVERED: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700",
    CANCELLED: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700",
    RETURNED: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700"
  };
  return colors[status] || colors.PLACED;
};

// Format date to Indian format
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format price to Indian Rupees
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(price || 0);
};

// Calculate item total and savings
export const calculateProductDetails = (product) => {
  const quantity = product.quantity || 0;
  const price = product.price || 0;
  const originalPrice = product.originalPrice || price;
  
  const itemTotal = price * quantity;
  const saved = (originalPrice - price) * quantity;
  
  return { itemTotal, saved, originalTotal: originalPrice * quantity };
};

// Get action buttons based on status
export const getActionButtons = (params) => {
  const { status, loading, handleTrackOrder, handleCancelClick } = params;
  
  const baseActions = [
    {
      label: "Track Order",
      icon: <Truck className="w-4 h-4" />,
      onClick: handleTrackOrder,
      variant: "primary",
      showFor: ["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED"],
      disabled: loading
    },
    {
      label: "Contact Support",
      icon: <MessageCircle className="w-4 h-4" />,
      onClick: () => window.open('/support', '_blank'),
      variant: "outline",
      showFor: ["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"]
    },
    {
      label: "View Details",
      icon: <ExternalLink className="w-4 h-4" />,
      onClick: () => console.log("View details"),
      variant: "outline",
      showFor: ["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"]
    }
  ];

  const statusActions = {
    PLACED: [
      {
        label: "Cancel Order",
        icon: <XCircle className="w-4 h-4" />,
        onClick: handleCancelClick,
        variant: "danger",
        showFor: ["PLACED"]
      }
    ],
    CONFIRMED: [
      {
        label: "Cancel Order",
        icon: <XCircle className="w-4 h-4" />,
        onClick: handleCancelClick,
        variant: "danger",
        showFor: ["CONFIRMED"]
      }
    ],
    SHIPPED: [
      {
        label: "Track Shipment",
        icon: <Truck className="w-4 h-4" />,
        onClick: () => console.log("Track shipment"),
        variant: "success",
        showFor: ["SHIPPED"]
      },
      {
        label: "Contact Courier",
        icon: <MessageCircle className="w-4 h-4" />,
        onClick: () => console.log("Contact courier"),
        variant: "outline",
        showFor: ["SHIPPED"]
      }
    ],
    DELIVERED: [
      {
        label: "Rate & Review",
        icon: <Star className="w-4 h-4" />,
        onClick: () => console.log("Rate & review"),
        variant: "success",
        showFor: ["DELIVERED"]
      },
      {
        label: "Return/Exchange",
        icon: <RotateCw className="w-4 h-4" />,
        onClick: () => console.log("Return/Exchange"),
        variant: "warning",
        showFor: ["DELIVERED"]
      }
    ],
    CANCELLED: [
      {
        label: "Reorder",
        icon: <RotateCw className="w-4 h-4" />,
        onClick: () => console.log("Reorder"),
        variant: "primary",
        showFor: ["CANCELLED"]
      },
      {
        label: "Help with Cancellation",
        icon: <HelpCircle className="w-4 h-4" />,
        onClick: () => console.log("Help with cancellation"),
        variant: "outline",
        showFor: ["CANCELLED"]
      }
    ],
    RETURNED: [
      {
        label: "Reorder",
        icon: <RotateCw className="w-4 h-4" />,
        onClick: () => console.log("Reorder"),
        variant: "primary",
        showFor: ["RETURNED"]
      },
      {
        label: "Refund Status",
        icon: <HelpCircle className="w-4 h-4" />,
        onClick: () => console.log("Refund status"),
        variant: "outline",
        showFor: ["RETURNED"]
      }
    ]
  };

  const allActions = [
    ...baseActions.filter(action => action.showFor.includes(status)),
    ...(statusActions[status] || [])
  ];

  return allActions;
};

// Button variant classes
export const buttonVariantClasses = {
  primary: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white",
  danger: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white",
  success: "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white",
  warning: "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white",
  outline: "border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
};