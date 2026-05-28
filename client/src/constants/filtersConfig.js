/** Shared filter options for category sidebar (client + API query mapping) */

export const DEFAULT_FILTERS = {
  priceRange: [],
  discount: [],
  ratings: [],
  ageGroup: [],
  colors: [],
  material: [],
  availability: [],
  offers: [],
  badges: [],
  sort: "newest",
};

export const SORT_OPTIONS = [
  { label: "Newest first", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Top rated", value: "rating" },
  { label: "Best discount", value: "discount" },
];

export const PRICE_RANGES = [
  { label: "Under ₹199", value: "0-199" },
  { label: "₹200 – ₹499", value: "200-499" },
  { label: "₹500 – ₹999", value: "500-999" },
  { label: "₹1,000 – ₹1,999", value: "1000-1999" },
  { label: "₹2,000 & above", value: "2000-999999" },
];

export const DISCOUNT_OPTIONS = [
  { label: "10% or more", value: "10" },
  { label: "20% or more", value: "20" },
  { label: "30% or more", value: "30" },
  { label: "40% or more", value: "40" },
  { label: "50% or more", value: "50" },
];

export const RATING_OPTIONS = [
  { label: "4★ & above", value: "4" },
  { label: "3★ & above", value: "3" },
  { label: "2★ & above", value: "2" },
];

export const AGE_GROUP_OPTIONS = [
  { label: "0 – 3 years", value: "0-3" },
  { label: "3 – 6 years", value: "3-6" },
  { label: "6 – 9 years", value: "6-9" },
  { label: "9 – 12 years", value: "9-12" },
  { label: "12+ years", value: "12+" },
];

export const MATERIAL_OPTIONS = [
  { label: "Plastic", value: "Plastic" },
  { label: "Wood", value: "Wood" },
  { label: "Metal", value: "Metal" },
  { label: "Cotton", value: "Cotton" },
  { label: "Synthetic", value: "Synthetic" },
  { label: "Alloy", value: "Alloy" },
  { label: "Paper", value: "Paper" },
  { label: "Other", value: "Other" },
];

export const COLOR_OPTIONS = [
  { label: "Red", value: "Red", swatch: "bg-red-500" },
  { label: "Blue", value: "Blue", swatch: "bg-blue-500" },
  { label: "Green", value: "Green", swatch: "bg-green-500" },
  { label: "Yellow", value: "Yellow", swatch: "bg-yellow-400" },
  { label: "Pink", value: "Pink", swatch: "bg-pink-500" },
  { label: "Black", value: "Black", swatch: "bg-gray-900" },
  { label: "White", value: "White", swatch: "bg-white border border-gray-300" },
  { label: "Multi", value: "Multi", swatch: "bg-gradient-to-br from-red-400 via-green-400 to-blue-400" },
];

export const AVAILABILITY_OPTIONS = [
  { label: "In stock", value: "in" },
  { label: "Out of stock", value: "out" },
];

export const OFFER_OPTIONS = [
  { label: "On sale (discounted)", value: "sale" },
  { label: "Free shipping", value: "freeShipping" },
];

export const BADGE_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Best seller", value: "bestseller" },
  { label: "New arrival", value: "new" },
];

export function countActiveFilters(filters) {
  let count = 0;
  for (const key of Object.keys(filters)) {
    if (key === "sort") continue;
    const val = filters[key];
    if (Array.isArray(val)) count += val.length;
  }
  return count;
}
