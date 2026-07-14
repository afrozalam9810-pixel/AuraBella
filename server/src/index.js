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
 */

require("dotenv").config();

const express      = require("express");
const cors         = require("cors");
const cookieParser = require("cookie-parser");
const mongoose     = require("mongoose");
const helmet       = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const { rateLimit } = require("express-rate-limit");

const connectDB         = require("./config/db");
const healthRouter      = require("./routes/health.route");
const authRouter        = require("./routes/auth.route");
const categoryRouter    = require("./routes/categories.route");
const productRouter     = require("./routes/products.route");
const cartRouter        = require("./routes/cart.route");
const wishlistRouter    = require("./routes/wishlist.route");
const orderRouter       = require("./routes/orders.route");
const adminOrderRouter  = require("./routes/adminOrders.route");
const adminCouponRouter = require("./routes/coupons.route");
const adminUserRouter   = require("./routes/users.route");
const adminStatsRouter  = require("./routes/adminStats.route");
const paymentRouter     = require("./routes/payments.route");
const adminEmailRouter  = require("./routes/email.route");
const bannersRouter     = require("./routes/banners.route");
const { adminRouter: adminQARouter } = require("./routes/productQA.route");
const pushRouter        = require("./routes/push.route");
const errorHandler      = require("./middleware/errorHandler");

// ─── App Setup ────────────────────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 5000;

// ─── 1. Helmet — secure HTTP headers ─────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy:    false, // handled by frontend CDN
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

// ─── 3. Body parsers & cookie parser ─────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ─── 4. NoSQL Injection Prevention ───────────────────────────────────────────
// Strips keys beginning with `$` or containing `.` from req.body, req.params,
// and req.query so MongoDB operators cannot be injected via API payloads.
app.use(
  mongoSanitize({
    allowDots: false,
    onSanitize: ({ req, key }) => {
      console.warn(`[Security] Sanitized suspicious key "${key}" on ${req.method} ${req.originalUrl}`);
    },
  })
);

// ─── 5. Rate Limiting ─────────────────────────────────────────────────────────
const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  return (forwarded ? forwarded.split(",")[0].trim() : null) || req.socket.remoteAddress || "unknown";
};

// General API limiter — 500 req / 15 min per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIp,
  skip: (req) => {
    const path = req.originalUrl || "";
    return (
      path.startsWith("/api/products") ||
      path.startsWith("/api/categories") ||
      path.startsWith("/api/health")
    );
  },
  message: { success: false, message: "Too many requests. Please try again in 15 minutes." },
});

// Strict auth limiter — 30 req / 15 min (prevents brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIp,
  message: { success: false, message: "Too many login attempts. Please try again later." },
});

app.use(generalLimiter);
app.use("/api/auth/login",           authLimiter);
app.use("/api/auth/register",        authLimiter);
app.use("/api/auth/forgot-password", authLimiter);
app.use("/api/auth/reset-password",  authLimiter);

// ─── 6. CSRF Token stub ───────────────────────────────────────────────────────
// The csrf-csrf double-submit-cookie pattern is incompatible with cross-origin
// SPA+REST deployments (frontend on Cloudflare, API on Railway — different domains).
// CSRF protection is instead enforced by:
//   • CORS origin whitelist (only aurabellaafroz.com is allowed)
//   • SameSite=Lax cookies on the auth JWT
//   • Helmet security headers
// This endpoint returns a no-op token so any cached frontend build that calls
// GET /api/csrf-token does not throw a 404.
app.get("/api/csrf-token", (_req, res) => {
  res.json({ csrfToken: "no-op" });
});

// ─── Request Logger (dev only) ────────────────────────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use((req, _res, next) => {
    console.log(`\x1b[36m→ ${req.method}\x1b[0m ${req.originalUrl}`);
    next();
  });
}

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/health",        healthRouter);
app.use("/api/auth",          authRouter);
app.use("/api/categories",    categoryRouter);
app.use("/api/products",      productRouter);
app.use("/api/cart",          cartRouter);
app.use("/api/wishlist",      wishlistRouter);
app.use("/api/orders",        orderRouter);
app.use("/api/admin/orders",  adminOrderRouter);
app.use("/api/admin/coupons", adminCouponRouter);
app.use("/api/admin/users",   adminUserRouter);
app.use("/api/admin/stats",   adminStatsRouter);
app.use("/api/payments",      paymentRouter);
app.use("/api/admin/emails",  adminEmailRouter);
app.use("/api/banners",       bannersRouter);
app.use("/api/admin/qa",      adminQARouter);
app.use("/api/push",          pushRouter);

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found. Check the API documentation.",
  });
});

// ─── Global Error Handler (must be the LAST middleware) ───────────────────────
app.use(errorHandler);

// ─── Bootstrap ────────────────────────────────────────────────────────────────
const startServer = async () => {
  const dbConnected = await connectDB();

  if (!dbConnected) {
    console.warn(
      "\x1b[33m[Server]\x1b[0m  Starting without database — " +
      "routes that require DB access will return errors."
    );
  } else {
    try {
      const { scheduleBackups } = require("./services/backupService");
      scheduleBackups();
    } catch (err) {
      console.error("[Backup] Failed to schedule backups:", err.message);
    }
  }

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
  process.once("SIGINT",  () => shutdown("SIGINT"));
};

startServer().catch((err) => {
  console.error("\x1b[31m[Server]\x1b[0m  Fatal startup error:", err.message);
  process.exit(1);
});
