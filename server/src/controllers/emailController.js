/**
 * emailController.js
 * Admin controller for manual email campaigns, newsletter dispatches, and email log auditing.
 */

const EmailLog = require("../models/EmailLog.model");
const User = require("../models/User.model");
const { 
  sendCampaignEmail, 
  sendCouponReceived, 
  processEmailQueue 
} = require("../services/email/emailService");

/**
 * @desc    Send manual campaign email to single, multiple, or all users
 * @route   POST /api/admin/emails/send
 * @access  Private (Admin Only)
 */
const sendManualCampaignEmail = async (req, res, next) => {
  try {
    const { 
      recipients, 
      title, 
      headline, 
      body, 
      ctaText, 
      ctaUrl, 
      template = "newsletter",
      couponCode,
      discountText,
      minOrderText,
      expiryDate 
    } = req.body;

    if (!recipients || !title) {
      res.status(400);
      throw new Error("Recipients and title/subject are required.");
    }

    let targetEmails = [];

    if (recipients === "all") {
      // Fetch all active users with emails
      const users = await User.find({ isActive: true, email: { $exists: true, $ne: "" } }).select("email name");
      targetEmails = users.map(u => ({ email: u.email, name: u.name }));
    } else if (Array.isArray(recipients)) {
      // Query names for given emails
      const users = await User.find({ email: { $in: recipients } }).select("email name");
      const userMap = new Map(users.map(u => [u.email.toLowerCase(), u.name]));
      targetEmails = recipients.map(email => ({
        email: email.trim(),
        name: userMap.get(email.trim().toLowerCase()) || "Valued Customer"
      }));
    } else if (typeof recipients === "string") {
      const user = await User.findOne({ email: recipients.toLowerCase() }).select("name");
      targetEmails = [{
        email: recipients.trim(),
        name: user ? user.name : "Valued Customer"
      }];
    }

    if (targetEmails.length === 0) {
      res.status(400);
      throw new Error("No valid recipient email addresses found.");
    }

    console.log(`[Campaign] Enqueueing ${targetEmails.length} emails for campaign: "${title}"`);

    for (const target of targetEmails) {
      const unsubscribeUrl = `https://www.aurabellaafroz.com/newsletter/unsubscribe?email=${encodeURIComponent(target.email)}`;
      
      if (template === "couponReceived" && couponCode) {
        await sendCouponReceived(target.email, target.name, {
          couponCode,
          discountText,
          minOrderText,
          expiryDate
        });
      } else {
        await sendCampaignEmail(
          target.email, 
          title, 
          headline || title, 
          body || "", 
          ctaText || "Explore Collection", 
          ctaUrl || "https://www.aurabellaafroz.com",
          unsubscribeUrl
        );
      }
    }

    res.status(200).json({
      success: true,
      message: `Successfully enqueued ${targetEmails.length} email campaign dispatches.`,
      enqueuedCount: targetEmails.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get paginated email logs for auditing
 * @route   GET /api/admin/emails/logs
 * @access  Private (Admin Only)
 */
const getEmailLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { recipient: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { template: { $regex: search, $options: "i" } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skipNum = (pageNum - 1) * limitNum;

    const total = await EmailLog.countDocuments(query);
    const logs = await EmailLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skipNum)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      pages: Math.ceil(total / limitNum),
      page: pageNum,
      limit: limitNum,
      data: logs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Manually retry sending a failed email log
 * @route   POST /api/admin/emails/logs/:id/retry
 * @access  Private (Admin Only)
 */
const retryEmailLog = async (req, res, next) => {
  try {
    const log = await EmailLog.findById(req.params.id);

    if (!log) {
      res.status(404);
      throw new Error("Email log record not found.");
    }

    log.status = "pending";
    log.retries = 0;
    log.error = "";
    await log.save();

    // Trigger processing
    setImmediate(() => {
      processEmailQueue().catch((err) =>
        console.error("[EmailQueue] Manual retry processing error:", err.message)
      );
    });

    res.status(200).json({
      success: true,
      message: "Email reset to pending status and enqueued for dispatch retry.",
      data: log
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendManualCampaignEmail,
  getEmailLogs,
  retryEmailLog
};
