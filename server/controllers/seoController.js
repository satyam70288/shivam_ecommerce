const Product = require("../models/Product");
const Category = require("../models/Category");
const { PUBLIC_PRODUCT_FILTER } = require("../utils/productVisibility");

const CLIENT_URL = (process.env.CLIENT_URL || "https://shivam-ecommerce.vercel.app").replace(
  /\/$/,
  ""
);

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlEntry(loc, lastmod, changefreq, priority) {
  const parts = [`  <url>`, `    <loc>${escapeXml(loc)}</loc>`];
  if (lastmod) parts.push(`    <lastmod>${lastmod}</lastmod>`);
  if (changefreq) parts.push(`    <changefreq>${changefreq}</changefreq>`);
  if (priority != null) parts.push(`    <priority>${priority}</priority>`);
  parts.push(`  </url>`);
  return parts.join("\n");
}

exports.sitemap = async (req, res) => {
  try {
    const [products, categories] = await Promise.all([
      Product.find(PUBLIC_PRODUCT_FILTER)
        .select("_id updatedAt")
        .sort({ updatedAt: -1 })
        .limit(5000)
        .lean(),
      Category.find().select("slug updatedAt").lean(),
    ]);

    const staticPaths = [
      { path: "", priority: "1.0", changefreq: "daily" },
      { path: "about", priority: "0.6", changefreq: "monthly" },
      { path: "contact", priority: "0.6", changefreq: "monthly" },
      { path: "faq", priority: "0.5", changefreq: "monthly" },
      { path: "Termsandconditions", priority: "0.4", changefreq: "yearly" },
    ];

    const entries = [];

    for (const page of staticPaths) {
      const loc = page.path ? `${CLIENT_URL}/${page.path}` : CLIENT_URL;
      entries.push(urlEntry(loc, null, page.changefreq, page.priority));
    }

    for (const cat of categories) {
      if (!cat.slug) continue;
      const lastmod = cat.updatedAt
        ? new Date(cat.updatedAt).toISOString().split("T")[0]
        : null;
      entries.push(
        urlEntry(
          `${CLIENT_URL}/category/${cat.slug}`,
          lastmod,
          "weekly",
          "0.8"
        )
      );
    }

    for (const p of products) {
      const lastmod = p.updatedAt
        ? new Date(p.updatedAt).toISOString().split("T")[0]
        : null;
      entries.push(
        urlEntry(`${CLIENT_URL}/product/${p._id}`, lastmod, "weekly", "0.7")
      );
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`;

    res.set("Content-Type", "application/xml");
    res.send(xml);
  } catch (err) {
    console.error("Sitemap error:", err);
    res.status(500).send("Sitemap generation failed");
  }
};
