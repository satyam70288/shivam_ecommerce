/**
 * Content-Security-Policy for the Express API.
 * JSON responses are not rendered as documents; CSP mainly applies to HTML
 * (e.g. health page) and sets a safe default for any browser-loaded responses.
 */

function getApiCspDirectives() {
  return {
    defaultSrc: ["'none'"],
    scriptSrc: ["'none'"],
    styleSrc: ["'none'"],
    imgSrc: ["'none'"],
    connectSrc: ["'self'"],
    fontSrc: ["'none'"],
    objectSrc: ["'none'"],
    mediaSrc: ["'none'"],
    frameSrc: ["'none'"],
    frameAncestors: ["'none'"],
    baseUri: ["'none'"],
    formAction: ["'none'"],
  };
}

/** Minimal CSP for the HTML health check at GET / */
function getHealthPageCspDirectives() {
  return {
    defaultSrc: ["'none'"],
    styleSrc: ["'unsafe-inline'"],
    imgSrc: ["'self'"],
    frameAncestors: ["'none'"],
    baseUri: ["'none'"],
    formAction: ["'none'"],
  };
}

function getHelmetConfig(isProduction = false) {
  return {
    contentSecurityPolicy: {
      directives: getApiCspDirectives(),
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: isProduction
      ? {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        }
      : false,
  };
}

module.exports = {
  getApiCspDirectives,
  getHealthPageCspDirectives,
  getHelmetConfig,
};
