/**
 * logger.js
 * Structured, rotating file-based logger using Winston.
 *
 * Log files:
 *   logs/combined-%DATE%.log   – all levels (rotated daily, 14d retention)
 *   logs/error-%DATE%.log      – errors only (rotated daily, 30d retention)
 *
 * Console output is always active in development.
 */

const path  = require("path");
const fs    = require("fs");
const { createLogger, format, transports } = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");

// ── Ensure log directory exists ──────────────────────────────────────────────
const LOG_DIR = path.join(__dirname, "../../logs");
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// ── Shared format ────────────────────────────────────────────────────────────
const logFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.errors({ stack: true }),
  format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return stack
      ? `[${timestamp}] ${level.toUpperCase()}: ${message}\n${stack}${metaStr}`
      : `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
  })
);

// ── Transports ───────────────────────────────────────────────────────────────
const combinedRotation = new DailyRotateFile({
  filename:      path.join(LOG_DIR, "combined-%DATE%.log"),
  datePattern:   "YYYY-MM-DD",
  zippedArchive: true,
  maxSize:       "20m",
  maxFiles:      "14d",        // Keep 14 days of combined logs
  level:         "info",
});

const errorRotation = new DailyRotateFile({
  filename:      path.join(LOG_DIR, "error-%DATE%.log"),
  datePattern:   "YYYY-MM-DD",
  zippedArchive: true,
  maxSize:       "10m",
  maxFiles:      "30d",        // Keep 30 days of error logs
  level:         "error",
});

// Notify when rotation happens
combinedRotation.on("rotate", (oldFile, newFile) => {
  console.log(`[Logger] Log rotated: ${oldFile} → ${newFile}`);
});

const loggerTransports = [combinedRotation, errorRotation];

// Always show coloured output in development
if (process.env.NODE_ENV !== "production") {
  loggerTransports.push(
    new transports.Console({
      format: format.combine(format.colorize(), logFormat),
    })
  );
}

const logger = createLogger({
  level:      "info",
  format:     logFormat,
  transports: loggerTransports,
  exitOnError: false,
});

// ── Convenience helpers ──────────────────────────────────────────────────────
logger.stream = {
  write: (message) => logger.info(message.trim()),
};

module.exports = logger;
