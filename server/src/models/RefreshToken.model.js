/**
 * RefreshToken.model.js
 * Stores server-side refresh token records for JWT token rotation.
 *
 * Design:
 *  - One refresh token document per active device/session.
 *  - Tokens are hashed with SHA-256 before storage (plain token sent to client).
 *  - Rotation on use: when a refresh token is used, it is immediately revoked
 *    and a new one is issued (prevents replay attacks).
 *  - Automatic TTL expiry via MongoDB TTL index on `expiresAt`.
 */

const mongoose = require("mongoose");
const crypto = require("crypto");

const refreshTokenSchema = new mongoose.Schema(
  {
    // SHA-256 hash of the raw token (raw token only ever lives in the cookie)
    tokenHash: {
      type:     String,
      required: true,
      unique:   true,
      index:    true,
    },
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      index:    true,
    },
    // Metadata for security auditing
    userAgent: { type: String, default: "" },
    ipAddress: { type: String, default: "" },
    // MongoDB TTL index will delete the document automatically after this date
    expiresAt: {
      type:     Date,
      required: true,
    },
    // Explicit revocation flag (for immediate logout / force-revoke all sessions)
    revoked: {
      type:    Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// TTL index — MongoDB removes expired tokens automatically
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static helper to hash a raw token for safe storage / comparison
refreshTokenSchema.statics.hash = (rawToken) =>
  crypto.createHash("sha256").update(rawToken).digest("hex");

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);
module.exports = RefreshToken;
