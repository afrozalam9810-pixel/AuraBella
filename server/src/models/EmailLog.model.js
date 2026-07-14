/**
 * EmailLog.model.js
 * Mongoose model to store transactional and marketing email logs, statuses, and retry records.
 */

const mongoose = require("mongoose");

const emailLogSchema = new mongoose.Schema(
  {
    recipient: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      required: true,
    },
    template: {
      type: String,
      required: true,
    },
    context: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },
    error: {
      type: String,
      default: "",
    },
    retries: {
      type: Number,
      default: 0,
      min: 0,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    failedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexing for quick queue polling and analytics
emailLogSchema.index({ status: 1, retries: 1 });
emailLogSchema.index({ recipient: 1 });
emailLogSchema.index({ createdAt: -1 });

const EmailLog = mongoose.model("EmailLog", emailLogSchema);
module.exports = EmailLog;
