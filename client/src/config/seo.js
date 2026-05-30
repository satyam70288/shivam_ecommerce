/** Site-wide SEO defaults — set VITE_SITE_URL in production (.env) */
export const SITE = {
  name: "Shree Laxmi Shop",
  defaultTitle: "Shree Laxmi Shop — Online Store",
  description:
    "Shop quality products at Shree Laxmi Shop. Best prices, secure checkout, and fast delivery across India.",
  locale: "en_IN",
  twitter: "",
  defaultImage: "/shivam_latest_logo.png",
  url: (import.meta.env.VITE_SITE_URL || "https://shivam-ecommerce.vercel.app").replace(
    /\/$/,
    ""
  ),
};

export function absoluteUrl(path = "") {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE.url}${p}`;
}

export function pageTitle(title) {
  if (!title) return SITE.defaultTitle;
  return `${title} | ${SITE.name}`;
}

/** Plain text for meta description (strip HTML, limit length) */
export function metaDescription(text, max = 160) {
  if (!text) return SITE.description;
  const plain = String(text)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max - 1).trim()}…`;
}

export function keywordsToString(keywords) {
  if (!keywords) return "";
  if (Array.isArray(keywords)) return keywords.filter(Boolean).join(", ");
  return String(keywords);
}
