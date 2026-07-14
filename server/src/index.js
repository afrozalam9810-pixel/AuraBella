/**
 * index.js
 * AuraBella Express server — entry point.
 *
 * Startup order:
 *   1. Load environment variables
 *   2. Create Express app & apply global middleware
 *   3. Mount route modules
 *   4. Register global error handler (must be last)
 *   5. Attempt MongoDB connection (with retry logic)
 *   6. Start HTTP listener AFTER DB attempt resolves
 *      (in dev: server starts even if DB is unavailable)
 *      (in prod: process.exit(1) if DB fails — see config/db.js)
 */

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const { rateLimit } = require("express-rate-limit");
const { doubleCsrf } = require("csrf-csrf");

const connectDB = require("./config/db");
const healthRouter = require("./routes/health.route");
const authRouter = require("./routes/auth.route");
const categoryRouter = require("./routes/categories.route");
const productRouter = require("./routes/products.route");
const cartRouter = require("./routes/cart.route");
const wishlistRouter = require("./routes/wishlist.route");
const orderRouter = require("./routes/orders.route");
const adminOrderRouter = require("./routes/adminOrders.route");
const adminCouponRouter = require("./routes/coupons.route");
const adminUserRouter = require("./routes/users.route");
const adminStatsRouter = require("./routes/adminStats.route");
const paymentRouter = require("./routes/payments.route");
const adminEmailRouter = require("./routes/email.route");
const bannersRouter = require("./routes/banners.route");
const { adminRouter: adminQARouter } = require("./routes/productQA.route");
const pushRouter = require("./routes/push.route");
const errorHandler = require("./middleware/errorHandler");

// ─── App Setup ────────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;

// ─── 1. Helmet — secure HTTP headers ──────────────────────────────────────────
// Disables the default CSP (our API is not a browser entrypoint);
// the SPA sets its own CSP via Vercel headers.
app.use(
  helmet({
    contentSecurityPolicy: false, // handled by frontend CDN
    crossOriginEmbedderPolicy: false, // prevents CORS issues on API calls
  })
);

// ─── 2. CORS ──────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.CLIENT_URL ? process.env.CLIENT_URL.replace("://", "://www.") : null,
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:3001",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  })
);

// ─── 3. Body parsers & cookie parser ──────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ─── 4. NoSQL Injection Prevention ────────────────────────────────────────────
// Strips keys beginning with `$` or containing `.` from req.body, req.params,
// and req.query so that MongoDB operators cannot be injected via API payloads.
app.use(
  mongoSanitize({
    allowDots: false,
    onSanitize: ({ req, key }) => {
      console.warn(`[Security] Sanitized suspicious key "${key}" on ${req.method} ${req.originalUrl}`);
    },
  })
);

// ─── 5. Rate Limiting ─────────────────────────────────────────────────────────
// General API limiter — generous enough for the admin dashboard
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use the real client IP from the x-forwarded-for header (set by Render/Railway proxies)
    const forwarded = req.headers["x-forwarded-for"];
    return (forwarded ? forwarded.split(",")[0].trim() : null) || req.socket.remoteAddress || "unknown";
  },
  skip: (req) => {
    // Skip rate limiting for public read-only endpoints to prevent false positives
    const path = req.originalUrl || "";
    return path.startsWith("/api/products") || path.startsWith("/api/categories") || path.startsWith("/api/health");
  },
  message: { success: false, message: "Too many requests. Please try again in 15 minutes." },
});

// Strict auth limiter — prevents brute-force login & OTP abuse
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const forwarded = req.headers["x-forwarded-for"];
    return (forwarded ? forwarded.split(",")[0].trim() : null) || req.socket.remoteAddress || "unknown";
  },
  message: { success: false, message: "Too many login attempts. Please try again later." },
});

app.use(generalLimiter);

// Apply strict auth limiter to authentication endpoints
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);
app.use("/api/auth/reset-password", authLimiter);

// ─── 6. CSRF Protection (Double-Submit Cookie Pattern) ────────────────────────
// This protects state-mutating endpoints against cross-site request forgery.
// The SPA must:
//   (a) Call GET /api/csrf-token to receive a token in the response body,
//   (b) Include that token as the X-CSRF-Token header on every mutating request.
//
// Public GET endpoints and Razorpay webhooks are exempt (safe methods + no cookies).
const {
  invalidCsrfTokenError,
  generateToken,
  doubleCsrfProtection,
} = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || "aurabella-csrf-secret-change-in-production",
  cookieName: "__Host-psifi.x-csrf-token",
  cookieOptions: {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  },
  size: 64,
  ignoredMethods: ["GET", "HEAD", "OPTIONS"],
  getTokenFromRequest: (req) => req.headers["x-csrf-token"],
});

// Endpoint for the SPA to fetch a fresh CSRF token
app.get("/api/csrf-token", (req, res) => {
  res.json({ csrfToken: generateToken(req, res) });
});

// Apply CSRF protection globally to all mutating routes
app.use((req, res, next) => {
  // Skip CSRF for Razorpay webhook callbacks (server-to-server, no cookie)
  if (req.originalUrl.startsWith("/api/payments/webhook")) return next();
  doubleCsrfProtection(req, res, next);
});

// Return a structured 403 when CSRF validation fails
app.use((err, req, res, next) => {
  if (err === invalidCsrfTokenError) {
    return res.status(403).json({ success: false, message: "Invalid or missing CSRF token." });
  }
  next(err);
});

// ─── Request Logger (dev only) ────────────────────────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use((req, _res, next) => {
    console.log(`\x1b[36m→ ${req.method}\x1b[0m ${req.originalUrl}`);
    next();
  });
}

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/orders", orderRouter);
app.use("/api/admin/orders", adminOrderRouter);
app.use("/api/admin/coupons", adminCouponRouter);
app.use("/api/admin/users", adminUserRouter);
app.use("/api/admin/stats", adminStatsRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/admin/emails", adminEmailRouter);
app.use("/api/banners", bannersRouter);
app.use("/api/admin/qa", adminQARouter);
app.use("/api/push", pushRouter);

// ── 404 handler — catches any route not matched above ─────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found. Check the API documentation.",
  });
});

// ─── Global Error Handler (must be the LAST middleware) ───────────────────────
app.use(errorHandler);

// ─── Bootstrap ───────────────────────────────────────────────────────────────
// Wrap startup in an async function so we can await the DB connection
// before opening the HTTP port. This prevents the server from accepting
// requests before it is ready in production.

const startServer = async () => {
  // 1. Connect to MongoDB (retries internally; exits in prod on failure)
  const dbConnected = await connectDB();

  if (!dbConnected) {
    console.warn(
      "\x1b[33m[Server]\x1b[0m  Starting without database — " +
      "routes that require DB access will return errors."
    );
  } else {
    // Start automated daily database backup job
    try {
      const { scheduleBackups } = require("./services/backupService");
      scheduleBackups();
    } catch (err) {
      console.error("[Backup] Failed to schedule backups:", err.message);
    }
  }

  // 2. Start HTTP listener. Railway routes traffic to the injected PORT over
  // IPv4, so bind explicitly to all IPv4 interfaces rather than relying on
  // the platform-specific default host.
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `\n\x1b[35m╔══════════════════════════════════════════╗\x1b[0m`
    );
    console.log(
      `\x1b[35m║  \x1b[1m🌸 AuraBella API\x1b[0m\x1b[35m                        ║\x1b[0m`
    );
    console.log(
      `\x1b[35m╠══════════════════════════════════════════╣\x1b[0m`
    );
    console.log(
      `\x1b[35m║\x1b[0m  Server   : \x1b[32mhttp://localhost:${PORT}\x1b[0m         \x1b[35m║\x1b[0m`
    );
    console.log(
      `\x1b[35m║\x1b[0m  Health   : \x1b[32mhttp://localhost:${PORT}/api/health\x1b[0m \x1b[35m║\x1b[0m`
    );
    console.log(
      `\x1b[35m║\x1b[0m  Mode     : \x1b[33m${process.env.NODE_ENV || "development"}\x1b[0m                  \x1b[35m║\x1b[0m`
    );
    console.log(
      `\x1b[35m║\x1b[0m  Database : ${dbConnected ? "\x1b[32m✔ connected\x1b[0m" : "\x1b[31m✘ disconnected\x1b[0m"}             \x1b[35m║\x1b[0m`
    );
    console.log(
      `\x1b[35m╚══════════════════════════════════════════╝\x1b[0m\n`
    );
  });

  // Railway sends SIGTERM while replacing or stopping a deployment. Stop
  // accepting new requests first, then close the database connection before
  // exiting. This prevents in-flight requests from being dropped abruptly.
  const shutdown = (signal) => {
    console.log(`[Server] ${signal} received; shutting down gracefully.`);
    server.close(async () => {
      await mongoose.connection.close().catch((err) => {
        console.error("[Server] Error closing MongoDB connection:", err.message);
      });
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.once("SIGTERM", () => shutdown("SIGTERM"));
  process.once("SIGINT", () => shutdown("SIGINT"));
};

// Kick off startup — catch any unexpected top-level errors
startServer().catch((err) => {
  console.error("\x1b[31m[Server]\x1b[0m  Fatal startup error:", err.message);
  process.exit(1);
});
