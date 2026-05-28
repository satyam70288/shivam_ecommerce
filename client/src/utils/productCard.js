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

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=600&auto=format&fit=crop";

export const getImageUrl = ({ image, images, variants, imageError }) => {
  if (imageError) return FALLBACK_IMAGE;

  if (typeof image === "string" && image.trim()) return image.trim();
  if (image?.url) return image.url;

  if (Array.isArray(images) && images.length > 0) {
    const first = images[0];
    if (typeof first === "string" && first.trim()) return first.trim();
    if (first?.url) return first.url;
  }

  if (variants?.[0]?.images?.[0]?.url) return variants[0].images[0].url;

  return FALLBACK_IMAGE;
};
