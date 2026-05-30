import { SITE, absoluteUrl } from "@/config/seo";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    logo: absoluteUrl(SITE.defaultImage),
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE.url}/?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function productSchema(product, sellingPrice) {
  if (!product) return null;

  const image =
    product.images?.[0]?.url ||
    product.image?.url ||
    (typeof product.image === "string" ? product.image : null);

  const price = Number(sellingPrice ?? product.price) || 0;
  const stock = Number(product.stock) || 0;
  const inStock = stock > 0;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: image ? [image] : undefined,
    sku: product._id,
    brand: product.brand
      ? { "@type": "Brand", name: product.brand }
      : { "@type": "Brand", name: SITE.name },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/product/${product._id}`),
      priceCurrency: "INR",
      price: price.toFixed(2),
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
    aggregateRating:
      product.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          }
        : undefined,
  };
}

export function faqPageSchema(faqs) {
  if (!faqs?.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function breadcrumbSchema(items) {
  if (!items?.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url ? absoluteUrl(item.url) : undefined,
    })),
  };
}
