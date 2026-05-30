const MANAGED = "data-seo-managed";

function upsertMetaByName(name, content) {
  if (content == null || content === "") return;
  let el = document.querySelector(`meta[name="${name}"][${MANAGED}]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    el.setAttribute(MANAGED, "true");
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertMetaByProperty(property, content) {
  if (content == null || content === "") return;
  let el = document.querySelector(`meta[property="${property}"][${MANAGED}]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    el.setAttribute(MANAGED, "true");
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel, href) {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"][${MANAGED}]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    el.setAttribute(MANAGED, "true");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function upsertJsonLd(id, data) {
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  if (!data) return;
  const script = document.createElement("script");
  script.id = id;
  script.type = "application/ld+json";
  script.setAttribute(MANAGED, "true");
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

export function clearManagedSeo() {
  document.querySelectorAll(`[${MANAGED}]`).forEach((el) => el.remove());
}

export function applySeoToDocument({
  title,
  description,
  keywords,
  canonical,
  image,
  type = "website",
  noindex = false,
  jsonLd,
  jsonLdId = "seo-json-ld",
}) {
  if (title) document.title = title;

  upsertMetaByName("description", description);
  if (keywords) upsertMetaByName("keywords", keywords);

  upsertMetaByName("robots", noindex ? "noindex, nofollow" : "index, follow");

  upsertMetaByProperty("og:title", title);
  upsertMetaByProperty("og:description", description);
  upsertMetaByProperty("og:type", type);
  upsertMetaByProperty("og:url", canonical);
  if (image) upsertMetaByProperty("og:image", image);

  upsertMetaByName("twitter:card", image ? "summary_large_image" : "summary");
  upsertMetaByName("twitter:title", title);
  upsertMetaByName("twitter:description", description);
  if (image) upsertMetaByName("twitter:image", image);

  if (canonical) upsertLink("canonical", canonical);

  upsertJsonLd(jsonLdId, jsonLd);
}
