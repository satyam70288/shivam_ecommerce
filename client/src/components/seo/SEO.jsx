import { useEffect } from "react";
import {
  SITE,
  absoluteUrl,
  pageTitle,
  metaDescription,
  keywordsToString,
} from "@/config/seo";
import { applySeoToDocument, clearManagedSeo } from "@/utils/seoHead";

/**
 * Per-route SEO (title, meta, Open Graph, Twitter, canonical, JSON-LD).
 */
export default function SEO({
  title,
  description,
  keywords,
  path = "",
  image,
  type = "website",
  noindex = false,
  jsonLd,
  jsonLdId,
}) {
  const jsonLdKey = jsonLd ? JSON.stringify(jsonLd) : "";

  useEffect(() => {
    const resolvedTitle = pageTitle(title);
    const resolvedDescription = metaDescription(description);
    const resolvedKeywords = keywordsToString(keywords) || undefined;
    const canonical = absoluteUrl(path);
    const resolvedImage = image
      ? image.startsWith("http")
        ? image
        : absoluteUrl(image)
      : absoluteUrl(SITE.defaultImage);

    applySeoToDocument({
      title: resolvedTitle,
      description: resolvedDescription,
      keywords: resolvedKeywords,
      canonical,
      image: resolvedImage,
      type,
      noindex,
      jsonLd,
      jsonLdId,
    });

    return () => {
      clearManagedSeo();
      document.title = SITE.defaultTitle;
    };
  }, [title, description, keywords, path, image, type, noindex, jsonLdKey, jsonLdId]);

  return null;
}
