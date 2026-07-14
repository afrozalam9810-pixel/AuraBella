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
const errorHandler = require("./middleware/errorHandler");

// ─── App Setup ────────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;

// ─── Global Middleware ────────────────────────────────────────────────────────

// Custom Rate Limiter
// Uses the real client IP (first entry in x-forwarded-for, not the proxy IP)
// to avoid false positives on Render where all traffic shares the same proxy.
const rateLimitWindowMs = 15 * 60 * 1000; // 15 minutes
const rateLimitMaxRequests = 500;          // raised — admin dashboard makes many calls
const ipRequestCache = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of ipRequestCache.entries()) {
    if (now > data.resetTime) {
      ipRequestCache.delete(ip);
    }
  }
}, rateLimitWindowMs);

const customRateLimiter = (req, res, next) => {
  // Completely bypass rate limiting for safe public read endpoints
  // to prevent dashboard or product browsing spikes from locking up connections.
  const path = req.originalUrl || req.url || "";
  if (
    path.startsWith("/api/products") ||
    path.startsWith("/api/categories") ||
    path.startsWith("/api/health")
  ) {
    return next();
  }

  // Take the FIRST IP from x-forwarded-for (the real client),
  // not the last (which is the Render/proxy IP shared by all users).
  const forwarded = req.headers["x-forwarded-for"];
  const ip = (forwarded ? forwarded.split(",")[0] : null) ||
             req.socket.remoteAddress ||
             "unknown";
  const now = Date.now();

  if (!ipRequestCache.has(ip)) {
    ipRequestCache.set(ip, { count: 1, resetTime: now + rateLimitWindowMs });
  } else {
    const data = ipRequestCache.get(ip);
    if (now > data.resetTime) {
      data.count = 1;
      data.resetTime = now + rateLimitWindowMs;
    } else {
      data.count++;
    }
    if (data.count > rateLimitMaxRequests) {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please try again in 15 minutes.",
      });
    }
  }
  next();
};

// Security Headers
// NOTE: CSP is intentionally omitted here — the frontend is a separate
// domain (Vercel) and the backend is an API server. Applying a CSP on the
// API responses does not protect the SPA and was previously blocking CORS
// preflight requests. The SPA should set its own CSP via Vercel headers config.
const customSecurityHeaders = (req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  if (req.secure) {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
};

app.use(customRateLimiter);
app.use(customSecurityHeaders);

// CORS — accept both production domains and local dev
// Supports: CLIENT_URL env var (set on Render), plus www variant and localhost.
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.CLIENT_URL ? process.env.CLIENT_URL.replace("://", "://www.") : null,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Parse incoming JSON bodies (max 10 MB — large enough for base64 image previews)
app.use(express.json({ limit: "10mb" }));

// Parse URL-encoded bodies (form submissions)
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Parse cookies (used by JWT refresh-token cookie strategy later)
app.use(cookieParser());

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
