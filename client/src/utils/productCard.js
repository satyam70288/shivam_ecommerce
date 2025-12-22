// utils/productHelpers.js

export const formatPrice = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

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
