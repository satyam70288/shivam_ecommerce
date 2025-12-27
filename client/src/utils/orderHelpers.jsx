// utils/orderHelpers.jsx
import { 
  Package, 
  CheckCircle, 
  Truck, 
  XCircle, 
  Clock,
  AlertCircle 
} from 'lucide-react';

// ========== PRICE FORMATTING ==========
export const formatPrice = (price, decimals = 1) => {
  if (price === null || price === undefined || price === '') return '0.0';
  
  const num = Number(price);
  if (isNaN(num)) return '0.0';
  
  // Format with specified decimals
  const formatted = num.toFixed(decimals);
  
  // Remove trailing zeros after decimal (optional, for cleaner look)
  return formatted.replace(/\.0$/, '.0'); // Keep .0 but remove extra zeros like .00
};

// Specific for savings (always 1 decimal)
export const formatSaveAmount = (amount) => {
  return formatPrice(amount, 1);
};

// ========== PRODUCT CALCULATIONS ==========
export const calculateProductDetails = (product) => {
  const price = Number(product.price) || 0;
  const originalPrice = Number(product.originalPrice) || price;
  const quantity = Number(product.quantity) || 1;
  
  const itemTotal = price * quantity;
  const originalTotal = originalPrice * quantity;
  const saved = Math.max(0, originalTotal - itemTotal); // Never negative
  
  return {
    // Raw values for calculations
    rawItemTotal: itemTotal,
    rawSaved: saved,
    rawOriginalTotal: originalTotal,
    
    // Formatted strings for display (1 decimal)
    itemTotal: formatPrice(itemTotal),
    saved: formatSaveAmount(saved),
    originalTotal: formatPrice(originalTotal),
    
    // Additional info
    pricePerUnit: price,
    originalPricePerUnit: originalPrice,
    quantity: quantity,
    discountPercent: originalPrice > price 
      ? Math.round(((originalPrice - price) / originalPrice) * 100) 
      : 0
  };
};

// ========== STATUS HELPERS ==========
export const getStatusIcon = (status, size = "w-4 h-4") => {
  const icons = {
    PLACED: <Package className={size} />,
    CONFIRMED: <CheckCircle className={size} />,
    PACKED: <Package className={size} />,
    SHIPPED: <Truck className={size} />,
    DELIVERED: <CheckCircle className={size} />,
    CANCELLED: <XCircle className={size} />,
    RETURNED: <Clock className={size} />,
  };
  return icons[status] || <AlertCircle className={size} />;
};

export const getStatusColor = (status) => {
  const colors = {
    PLACED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
    CONFIRMED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800",
    PACKED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800",
    SHIPPED: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800",
    DELIVERED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
    CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800",
    RETURNED: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700",
  };
  return colors[status] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700";
};

// ========== DATE FORMATTING ==========
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid Date";
  
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatShortDate = (dateString) => {
  if (!dateString) return "N/A";
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid Date";
  
  const now = new Date();
  const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short'
    });
  }
};

// ========== BUTTON STYLES ==========
export const buttonVariantClasses = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white border border-blue-600",
  secondary: "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700",
  danger: "bg-red-600 hover:bg-red-700 text-white border border-red-600",
  success: "bg-green-600 hover:bg-green-700 text-white border border-green-600",
  warning: "bg-yellow-500 hover:bg-yellow-600 text-white border border-yellow-500",
  outline: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700"
};

// ========== ACTION BUTTONS ==========
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
      icon: <AlertCircle className="w-4 h-4" />,
      onClick: () => window.open('/support', '_blank'),
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
        label: "Live Tracking",
        icon: <Truck className="w-4 h-4" />,
        onClick: () => console.log("Live tracking"),
        variant: "success",
        showFor: ["SHIPPED"]
      }
    ],
    DELIVERED: [
      {
        label: "Rate & Review",
        icon: <CheckCircle className="w-4 h-4" />,
        onClick: () => console.log("Rate & review"),
        variant: "success",
        showFor: ["DELIVERED"]
      },
      {
        label: "Return/Exchange",
        icon: <Clock className="w-4 h-4" />,
        onClick: () => console.log("Return/Exchange"),
        variant: "warning",
        showFor: ["DELIVERED"]
      }
    ],
    CANCELLED: [
      {
        label: "Reorder",
        icon: <Package className="w-4 h-4" />,
        onClick: () => console.log("Reorder"),
        variant: "primary",
        showFor: ["CANCELLED"]
      }
    ],
    RETURNED: [
      {
        label: "Reorder",
        icon: <Package className="w-4 h-4" />,
        onClick: () => console.log("Reorder"),
        variant: "primary",
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