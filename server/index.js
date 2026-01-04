// server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { readdirSync } = require("fs");
const morgan = require("morgan");
const helmet = require("helmet");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");
const { connectDb } = require("./db/connection");

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

/**
 * If your app is behind a proxy (nginx, vercel), enable trust proxy
 * so secure cookies and req.ip work correctly:
 */
// if (process.env.TRUST_PROXY === "true") {
//   app.set("trust proxy", 1);
// }
app.set("trust proxy", 1); // Ya 'true' bhi chalega
/* ========== BASIC MIDDLEWARES ========== */
// Body limits (prevent big payload DoS)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Logging (dev)
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

/* ========== SECURITY HEADERS ========== */
// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'"],
//         scriptSrc: [
//           "'self'",
//            "http://localhost:5173",
//           "https://checkout.razorpay.com", // Razorpay script
//         ],
//         connectSrc: [
//           "'self'",
//           "https://api.razorpay.com",      // Razorpay API
//           "https://checkout.razorpay.com", // Razorpay checkout
//         ],
//         frameSrc: [
//           "'self'",
//           "https://checkout.razorpay.com", // Razorpay iframe
//         ],
//         imgSrc: [
//           "'self'",
//           "data:",
//           "https://*.razorpay.com",        // Razorpay images/logos
//         ],
//         styleSrc: ["'self'", "'unsafe-inline'"], // keep inline if frontend injects styles
//       },
//     },
//     crossOriginEmbedderPolicy: false,
//   })
// );


/* ========== SANITIZATION ========== */
// Prevent NoSQL injection (Mongo specific)
app.use(mongoSanitize());
// Basic XSS cleaning of req.body, req.query, req.params
app.use(xss());
// Prevent duplicate params confusion
app.use(hpp());

/* ========== CORS ========== */
// you already have a whitelist function; keep that
const allowedOrigins = [
  "http://localhost:5173",
  "https://shivam-ecommerce.vercel.app",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.includes(origin) ||
      /^https:\/\/shivam-ecommerce-.*\.vercel\.app$/.test(origin)
    ) {
      return callback(null, true);
    }

    return callback(null, false); // ❌ error throw mat kar
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.options("*", cors());


/* ========== COOKIE PARSER (for csurf or cookie auth) ========== */
// app.use(cookieParser());

/* ========== RATE LIMITING ========== */
// Global limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // per IP
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);


/* ========== CSRF (optional, use if you use cookie-based auth) ========== */
/* Use cookie-based CSRF tokens if your frontend uses cookies.
   If you use Authorization header with Bearer token for APIs,
   do NOT enable csurf (it will block requests without a token).
*/
// if (process.env.ENABLE_CSRF === "true") {
//   // csurf with cookie (double submit cookie pattern)
//   app.use(
//     csurf({
//       cookie: {
//         httpOnly: true,
//         sameSite: "Strict", // or 'Lax' depending on UX
//         secure: process.env.NODE_ENV === "production",
//         maxAge: 3600,
//       },
//     })
//   );

//   // Example: expose CSRF token endpoint for frontend to fetch
//   app.get("/api/csrf-token", (req, res) => {
//     res.json({ csrfToken: req.csrfToken() });
//   });
// }

/* ========== Security: HSTS (strict transport security) ========== */
if (process.env.NODE_ENV === "production") {
  // tell browsers to only use HTTPS for this domain
  app.use(
    helmet.hsts({
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    })
  );
}

/* ========== Connect DB & Routes ========== */
connectDb();

// Health check
app.get("/", (req, res) => {
  res.send(`<center><h1>✅ Server Running on PORT: ${port}</h1></center>`);
});

// load routes
readdirSync("./routes").forEach((route) => {
  app.use("/api", require(`./routes/${route}`));
});

// 404
app.use((req, res) => {
  res.status(404).send({ message: "Route not found" });
});

/* ========== Error handler ========== */
app.use((err, req, res, next) => {
  console.error(err);
  if (err.code === "EBADCSRFTOKEN") {
    return res.status(403).json({ message: "Invalid CSRF token" });
  }
  res
    .status(err.status || 500)
    .json({ message: err.message || "Server error" });
});

/* ========== START ========== */
app.listen(port, () => {
  console.log(`🚀 Server running on PORT: ${port}`);
});
