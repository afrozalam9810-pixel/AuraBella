/**
 * health.route.js
 * A simple health-check endpoint used by load balancers, uptime monitors,
 * and the AuraBella client's test page to verify the API is reachable.
 *
 * GET /api/health
 */

const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

router.get("/", (req, res) => {
  // Map Mongoose connection states to human-readable labels
  const dbStates = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
    99: "uninitialized",
  };

  const dbState = mongoose.connection.readyState;

  res.status(200).json({
    success: true,
    status: "ok",
    message: "AuraBella API is running 🌸",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    database: {
      status: dbStates[dbState] || "unknown",
      name: mongoose.connection.name || null,
    },
    server: {
      node: process.version,
      platform: process.platform,
      port: process.env.PORT || 5000,
    },
  });
});

module.exports = router;
