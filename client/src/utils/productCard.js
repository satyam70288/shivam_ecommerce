// utils/productHelpers.js

// Flipkart जैसा price formatting
export const formatPrice = (amount) => {
  if (!amount && amount !== 0) return '₹--';
  
  // Indian numbering system with commas
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  
  return `₹${formatted}`;
};

// Discounted price के लिए (Flipkart जैसा)
export const formatPriceWithDiscount = (price, discountedPrice) => {
  if (!price || !discountedPrice) return { original: '₹--', discounted: '₹--' };
  
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
  
  const formattedDiscounted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(discountedPrice);
  
  return {
    original: `₹${formattedPrice}`,
    discounted: `₹${formattedDiscounted}`,
    discountPercent: Math.round(((price - discountedPrice) / price) * 100)
  };
};

// Flipkart style - Short format (for large amounts)
export const formatPriceShort = (amount) => {
  if (!amount && amount !== 0) return '₹--';
  
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)} L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)} K`;
  }
  return `₹${amount}`;
};

export const getStockStatus = (stock) => {
  if (stock <= 0) {
    return {
      text: "Out of Stock",
      color: "text-red-600 dark:text-red-300",
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border border-red-200 dark:border-red-800",
    };
  }

  if (stock <= 5) {
    return {
      text: `Only ${stock} left`,
      color: "text-amber-600 dark:text-amber-300",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      border: "border border-amber-200 dark:border-amber-800",
    };
  }

  return {
    text: "In Stock",
    color: "text-emerald-600 dark:text-emerald-300",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border border-emerald-200 dark:border-emerald-800",
  };
};

export const getImageUrl = ({ image, variants, imageError }) => {
  if (imageError) {
    return "https://images.pexels.com/photos/3801990/pexels-photo-3801990.jpeg";
  }
  if (image?.url) return image.url;
  if (variants?.[0]?.images?.[0]?.url)
    return variants[0].images[0].url;

  return "https://images.pexels.com/photos/3801990/pexels-photo-3801990.jpeg";
};
