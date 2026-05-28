/**
 * Content-Security-Policy for the Vite React app.
 * Used by vite dev/preview headers and injected into index.html on production build.
 */

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com";
const RAZORPAY_API = "https://api.razorpay.com";
const RAZORPAY_LUMBERJACK = "https://lumberjack.razorpay.com";

const FONT_SOURCES = [
  "https://fonts.googleapis.com",
  "https://fonts.gstatic.com",
];

const IMAGE_SOURCES = [
  "data:",
  "blob:",
  "https://res.cloudinary.com",
  "https://*.cloudinary.com",
  "https://images.unsplash.com",
  "https://via.placeholder.com",
  "https://api.dicebear.com",
  "https://*.razorpay.com",
];

function parseOrigin(url) {
  if (!url || typeof url !== "string") return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

/**
 * @param {boolean} isDev
 * @param {Record<string, string>} [env]
 */
export function buildCspDirectives(isDev, env = {}) {
  const apiOrigin = parseOrigin(env.VITE_API_URL);

  const connectSrc = [
    "'self'",
    RAZORPAY_API,
    RAZORPAY_LUMBERJACK,
    "https://nominatim.openstreetmap.org",
  ];

  if (apiOrigin) connectSrc.push(apiOrigin);

  if (isDev) {
    connectSrc.push(
      "ws://localhost:5173",
      "ws://127.0.0.1:5173",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:5000",
      "http://127.0.0.1:5000",
      "ws://localhost:5000",
      "ws://127.0.0.1:5000"
    );
  }

  const scriptSrc = ["'self'", RAZORPAY_SCRIPT];
  if (isDev) {
    scriptSrc.push("'unsafe-inline'", "'unsafe-eval'");
  }

  const directives = {
    "default-src": ["'self'"],
    "script-src": scriptSrc,
    "style-src": ["'self'", "'unsafe-inline'", ...FONT_SOURCES],
    "font-src": ["'self'", "data:", ...FONT_SOURCES],
    "img-src": ["'self'", ...IMAGE_SOURCES],
    "connect-src": connectSrc,
    "frame-src": [
      "'self'",
      RAZORPAY_SCRIPT,
      RAZORPAY_API,
    ],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
    "worker-src": ["'self'", "blob:"],
    "media-src": ["'self'", "blob:", "data:"],
  };

  if (!isDev) {
    directives["upgrade-insecure-requests"] = [];
  }

  return directives;
}

export function cspHeaderValue(isDev, env = {}) {
  const directives = buildCspDirectives(isDev, env);

  return Object.entries(directives)
    .filter(([, values]) => Array.isArray(values) && values.length > 0)
    .map(([key, values]) => `${key} ${values.join(" ")}`)
    .join("; ");
}

/** Escape for use inside a double-quoted HTML attribute */
export function cspMetaContent(isDev, env = {}) {
  return cspHeaderValue(isDev, env).replace(/"/g, "&quot;");
}
