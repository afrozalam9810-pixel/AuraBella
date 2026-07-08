/**
 * db.js
 * MongoDB connection helper using Mongoose.
 *
 * Responsibilities:
 *  - Connect to MongoDB using MONGO_URI from environment
 *  - Retry connection up to MAX_RETRIES times before giving up
 *  - Attach persistent Mongoose connection-event listeners
 *  - In production: crash the process on unrecoverable failure
 *  - In development: log a warning and let the server keep running
 *
 * Usage:
 *   const connectDB = require('./config/db');
 *   await connectDB();   // awaited in index.js before starting HTTP server
 */

const mongoose = require("mongoose");

// ─── Helpers ──────────────────────────────────────────────────────────────────

const log = {
  info:    (msg) => console.log(`\x1b[32m[DB]\x1b[0m  ${msg}`),
  warn:    (msg) => console.warn(`\x1b[33m[DB]\x1b[0m  ${msg}`),
  error:   (msg) => console.error(`\x1b[31m[DB]\x1b[0m  ${msg}`),
  divider: ()    => console.log("\x1b[35m" + "─".repeat(50) + "\x1b[0m"),
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Connection Event Listeners ───────────────────────────────────────────────
// Registered once so they persist across any reconnections Mongoose makes.

let listenersAttached = false;

function attachMongooseListeners() {
  if (listenersAttached) return;
  listenersAttached = true;

  mongoose.connection.on("connected", () => {
    log.info(`Connected  → ${mongoose.connection.host}/${mongoose.connection.name}`);
  });

  mongoose.connection.on("disconnected", () => {
    log.warn("Disconnected from MongoDB.");
  });

  mongoose.connection.on("reconnected", () => {
    log.info("Reconnected to MongoDB.");
  });

  mongoose.connection.on("error", (err) => {
    log.error(`Connection error: ${err.message}`);
  });

  // Ensure Mongoose closes cleanly when the process exits
  process.on("SIGINT", async () => {
    await mongoose.connection.close();
    log.info("Connection closed on SIGINT (Ctrl+C). Goodbye 🌸");
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    await mongoose.connection.close();
    log.info("Connection closed on SIGTERM. Goodbye 🌸");
    process.exit(0);
  });
}

// ─── Main Connect Function ────────────────────────────────────────────────────

const MAX_RETRIES   = 3;   // number of connection attempts before giving up
const RETRY_DELAY   = 3000; // ms between retries

/**
 * connectDB()
 * Attempts to open a Mongoose connection, retrying up to MAX_RETRIES times.
 *
 * @returns {Promise<boolean>} true = connected, false = failed (dev only)
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  const isProduction = process.env.NODE_ENV === "production";

  // ── Guard: MONGO_URI must be set ─────────────────────────────────────────
  if (!uri) {
    const msg =
      "MONGO_URI is not defined in environment variables. " +
      "Copy server/.env.example → server/.env and fill in your MongoDB URI.";

    if (isProduction) {
      log.error(msg);
      process.exit(1); // fatal in production — cannot run without DB
    } else {
      log.warn(msg);
      log.warn("Running WITHOUT database (development mode). Some routes will fail.");
      return false;
    }
  }

  // ── Mongoose global settings ──────────────────────────────────────────────
  mongoose.set("strictQuery", true); // suppress Mongoose 7 deprecation warning

  // Attach event listeners exactly once before the first connect call
  attachMongooseListeners();

  // ── Connection attempt loop ───────────────────────────────────────────────
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      log.divider();
      log.info(`Connection attempt ${attempt}/${MAX_RETRIES}…`);

      await mongoose.connect(uri, {
        // serverSelectionTimeoutMS — how long the driver waits to find an
        // available server before throwing. Keep low so startup isn't frozen.
        serverSelectionTimeoutMS: 5000,

        // socketTimeoutMS — how long a send/receive on a socket can take.
        socketTimeoutMS: 45000,

        // maxPoolSize — max simultaneous connections in the pool.
        // 10 is a safe default for a medium-traffic API.
        maxPoolSize: 10,
      });

      // ── Success ───────────────────────────────────────────────────────────
      const { host, port, name } = mongoose.connection;
      log.divider();
      log.info(`✔ Ready       → ${host}:${port}`);
      log.info(`✔ Database    → ${name}`);
      log.info(`✔ Pool size   → ${mongoose.connection.getClient().options.maxPoolSize ?? 10}`);
      log.divider();

      return true;
    } catch (err) {
      log.error(`Attempt ${attempt} failed: ${err.message}`);

      if (attempt < MAX_RETRIES) {
        log.warn(`Retrying in ${RETRY_DELAY / 1000}s…`);
        await sleep(RETRY_DELAY);
      }
    }
  }

  // ── All retries exhausted ─────────────────────────────────────────────────
  log.divider();
  log.error(`Could not connect to MongoDB after ${MAX_RETRIES} attempts.`);
  log.divider();

  if (isProduction) {
    log.error("Shutting down — cannot operate without database in production.");
    process.exit(1);
  } else {
    log.warn("Continuing WITHOUT database (development mode). Some routes will fail.");
    return false;
  }
};

module.exports = connectDB;
