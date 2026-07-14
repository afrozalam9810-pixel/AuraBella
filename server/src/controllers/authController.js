/**
 * authController.js
 * Controller handling user registration, login, logout, and profile retrieval.
 */

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User.model");

const getGoogleConfig = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackUrl = process.env.GOOGLE_CALLBACK_URL;
  if (!clientId || !clientSecret || !callbackUrl) {
    throw new Error("Google sign-in is not configured.");
  }
  return { clientId, callbackUrl, client: new OAuth2Client(clientId, clientSecret, callbackUrl) };
};

const getCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  ...(maxAge && { maxAge }),
});

const normalizePhone = (value) => {
  const digits = String(value || "").replace(/[^\d]/g, "");
  const internationalDigits = digits.length === 10 ? `91${digits}` : digits;
  if (!/^\d{8,15}$/.test(internationalDigits)) return null;
  return { providerValue: internationalDigits, storedValue: `+${internationalDigits}` };
};

const getMsg91AuthKey = () => {
  if (!process.env.MSG91_AUTH_KEY) throw new Error("Mobile OTP is not configured.");
  return process.env.MSG91_AUTH_KEY;
};

const msg91ErrorMessage = (data) => data?.message || data?.error || "Unable to send or verify the OTP. Please try again.";
const otpRequestTimes = new Map();

/**
 * Generate a JWT token signed with user's ID.
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

/**
 * Helper to set JWT cookie and send standard JSON response.
 */
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const cookieExpiryDays = parseInt(process.env.JWT_COOKIE_EXPIRES_IN, 10) || 7;
  const cookieOptions = {
    ...getCookieOptions(),
    expires: new Date(Date.now() + cookieExpiryDays * 24 * 60 * 60 * 1000),
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  const safeUser = user.toSafeObject();

  res.status(statusCode).cookie("token", token, cookieOptions).json({
    success: true,
    token,
    user: safeUser,
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validation
    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Please provide name, email, and password");
    }

    // 2. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("User already registered with this email");
    }

    // 3. Create user (password hashing handled by pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
    });

    // Send Welcome Email and Notify Admin
    try {
      const { sendWelcomeEmail, notifyAdminNewUser } = require("../services/email/emailService");
      sendWelcomeEmail(user.email, user.name);
      notifyAdminNewUser({ name: user.name, email: user.email, source: "Email Registration" });
    } catch (err) {
      console.error("Welcome email trigger failed:", err.message);
    }

    // 4. Send token in cookie and response
    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Validation
    if (!email || !password) {
      res.status(400);
      throw new Error("Please provide email and password");
    }

    // 2. Find user & explicitly select password
    const user = await User.findOne({ email }).select("+password");
    if (!user || !user.password) {
      res.status(401);
      throw new Error("Invalid credentials");
    }

    // 3. Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error("Invalid credentials");
    }

    // 4. Check if active or blocked
    if (!user.isActive || user.isBlocked) {
      res.status(403);
      throw new Error("Your account has been deactivated or blocked");
    }

    // 5. Send login alert email
    try {
      const { sendLoginAlert } = require("../services/email/emailService");
      const userAgent = req.headers["user-agent"] || "";
      let browser = "Unknown Browser";
      if (userAgent.includes("Chrome")) browser = "Google Chrome";
      else if (userAgent.includes("Safari")) browser = "Apple Safari";
      else if (userAgent.includes("Firefox")) browser = "Mozilla Firefox";
      else if (userAgent.includes("Edge")) browser = "Microsoft Edge";

      let device = "Desktop PC";
      if (userAgent.includes("Mobile") || userAgent.includes("Android") || userAgent.includes("iPhone")) {
        device = "Mobile Smart Device";
      }

      const ip = req.ip || req.connection.remoteAddress || "Unknown IP";
      sendLoginAlert(user.email, user.name, {
        date: new Date().toLocaleDateString("en-IN"),
        time: new Date().toLocaleTimeString("en-IN"),
        browser,
        device,
        ip,
        location: "India (Approximate)"
      });
    } catch (err) {
      console.error("Login alert trigger failed:", err.message);
    }

    // 6. Send response
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send a mobile verification code through MSG91.
 * @route   POST /api/auth/phone/request-otp
 * @access  Public
 */
const requestPhoneOtp = async (req, res, next) => {
  try {
    const phone = normalizePhone(req.body.phone);
    if (!phone) {
      res.status(400);
      throw new Error("Enter a valid mobile number with country code.");
    }

    const rateLimitKey = `${req.ip}:${phone.providerValue}`;
    const previousRequest = otpRequestTimes.get(rateLimitKey);
    if (previousRequest && Date.now() - previousRequest < 60 * 1000) {
      return res.status(429).json({ success: false, message: "Please wait one minute before requesting another OTP." });
    }

    const url = new URL("https://control.msg91.com/api/v5/otp");
    url.search = new URLSearchParams({
      authkey: getMsg91AuthKey(),
      mobile: phone.providerValue,
      ...(process.env.MSG91_OTP_TEMPLATE_ID && { template_id: process.env.MSG91_OTP_TEMPLATE_ID }),
    }).toString();

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.type === "error") {
      res.status(502);
      throw new Error(msg91ErrorMessage(data));
    }
    otpRequestTimes.set(rateLimitKey, Date.now());
    res.status(200).json({ success: true, message: "OTP sent to your mobile number." });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify a MSG91 OTP, then sign in or create the mobile account.
 * @route   POST /api/auth/phone/verify-otp
 * @access  Public
 */
const verifyPhoneOtp = async (req, res, next) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const otp = String(req.body.otp || "").trim();
    if (!phone || !/^\d{4,8}$/.test(otp)) {
      res.status(400);
      throw new Error("Enter a valid mobile number and OTP.");
    }

    const url = new URL("https://control.msg91.com/api/v5/otp/verify");
    url.search = new URLSearchParams({ otp, mobile: phone.providerValue }).toString();
    const response = await fetch(url, { headers: { authkey: getMsg91AuthKey() } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.type === "error") {
      res.status(401);
      throw new Error(msg91ErrorMessage(data));
    }

    let user = await User.findOne({ phone: phone.storedValue });
    if (!user) {
      const name = String(req.body.name || "").trim();
      if (name.length < 2) {
        return res.status(400).json({ success: false, message: "Enter your full name to create a new account." });
      }
      user = await User.create({
        name,
        phone: phone.storedValue,
        isPhoneVerified: true,
        phoneVerifiedAt: new Date(),
      });
    } else {
      user.isPhoneVerified = true;
      user.phoneVerifiedAt = new Date();
      await user.save();
    }

    if (!user.isActive || user.isBlocked) {
      res.status(403);
      throw new Error("Your account has been deactivated or blocked");
    }
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

const startGoogleAuth = (req, res, next) => {
  try {
    const { client } = getGoogleConfig();
    const state = crypto.randomBytes(32).toString("hex");
    res.cookie("google_oauth_state", state, getCookieOptions(10 * 60 * 1000));

    res.redirect(client.generateAuthUrl({
      access_type: "online",
      prompt: "select_account",
      scope: ["openid", "email", "profile"],
      state,
    }));
  } catch (error) {
    next(error);
  }
};

const completeGoogleAuth = async (req, res, next) => {
  const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
  const fail = (reason) => res.redirect(`${clientUrl}/auth/google/callback?error=${encodeURIComponent(reason)}`);

  try {
    const { code, state, error } = req.query;
    if (error) return fail(error === "access_denied" ? "Google sign-in was cancelled." : "Google sign-in failed.");
    if (!code || !state) return fail("Invalid Google sign-in response. Please try again.");
    if (!req.cookies?.google_oauth_state) {
      return fail("Google sign-in session expired. Enable cookies, then try again.");
    }

    const expectedState = Buffer.from(req.cookies.google_oauth_state, "utf8");
    const receivedState = Buffer.from(state, "utf8");
    res.clearCookie("google_oauth_state", getCookieOptions());
    if (expectedState.length !== receivedState.length || !crypto.timingSafeEqual(expectedState, receivedState)) {
      return fail("Invalid Google sign-in state. Please try again.");
    }

    const { client, clientId } = getGoogleConfig();
    const { tokens } = await client.getToken(code);
    if (!tokens.id_token) throw new Error("Google did not return an identity token.");
    const ticket = await client.verifyIdToken({ idToken: tokens.id_token, audience: clientId });
    const profile = ticket.getPayload();
    if (!profile?.sub || !profile.email || !profile.email_verified) {
      throw new Error("Your Google account does not have a verified email address.");
    }

    let user = await User.findOne({ googleId: profile.sub });
    if (!user) {
      user = await User.findOne({ email: profile.email.toLowerCase() });
      if (user) {
        user.googleId = profile.sub;
        if (!user.avatar && profile.picture) user.avatar = profile.picture;
        user.isVerified = true;
        await user.save();
      } else {
        user = await User.create({
          name: profile.name || profile.email.split("@")[0],
          email: profile.email.toLowerCase(),
          googleId: profile.sub,
          avatar: profile.picture || "",
          isVerified: true,
        });

        // Welcome and admin alerts
        try {
          const { sendWelcomeEmail, notifyAdminNewUser } = require("../services/email/emailService");
          sendWelcomeEmail(user.email, user.name);
          notifyAdminNewUser({ name: user.name, email: user.email, source: "Google OAuth" });
        } catch (err) {
          console.error("Google welcome email failed:", err.message);
        }
      }
    }

    if (!user.isActive || user.isBlocked) return fail("This account has been deactivated or blocked.");
    const token = generateToken(user._id);
    const cookieExpiryDays = parseInt(process.env.JWT_COOKIE_EXPIRES_IN, 10) || 7;
    res.cookie("token", token, {
      ...getCookieOptions(),
      expires: new Date(Date.now() + cookieExpiryDays * 24 * 60 * 60 * 1000),
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    // A URL fragment is never sent to the server or included in referrer headers.
    res.redirect(`${clientUrl}/auth/google/callback#token=${encodeURIComponent(token)}`);
  } catch (error) {
    console.error("Google authentication failed:", error.message);
    return fail("Google sign-in failed. Please try again.");
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private (auth middleware attached user)
 */
const getMe = async (req, res, next) => {
  try {
    // req.user is already populated by protect middleware
    const user = req.user.toSafeObject();
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user & clear cookie
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res, next) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0), // Set cookie to expire immediately
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile details
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);

    const changes = [];
    if (name && user.name !== name) {
      user.name = name;
      changes.push("Profile Name");
    }
    if (email && user.email !== email.toLowerCase()) {
      user.email = email.toLowerCase();
      changes.push("Profile Email");
    }

    await user.save();

    if (changes.length > 0) {
      try {
        const { sendProfileUpdated } = require("../services/email/emailService");
        sendProfileUpdated(user.email, user.name, changes);
      } catch (err) {
        console.error("Profile update email failed:", err.message);
      }
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add address to user profile
 * @route   POST /api/auth/addresses
 * @access  Private
 */
const addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Create new address
    user.addresses.push(req.body);
    await user.save();

    try {
      const { sendProfileUpdated } = require("../services/email/emailService");
      sendProfileUpdated(user.email, user.name, ["Added a new address"]);
    } catch (err) {
      console.error("Address add email failed:", err.message);
    }

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update address in user profile
 * @route   PUT /api/auth/addresses/:id
 * @access  Private
 */
const updateAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.id);

    if (!address) {
      res.status(404);
      throw new Error("Address not found");
    }

    // Update fields
    Object.assign(address, req.body);
    await user.save();

    try {
      const { sendProfileUpdated } = require("../services/email/emailService");
      sendProfileUpdated(user.email, user.name, ["Updated an address"]);
    } catch (err) {
      console.error("Address update email failed:", err.message);
    }

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete address from user profile
 * @route   DELETE /api/auth/addresses/:id
 * @access  Private
 */
const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.id);
    await user.save();

    try {
      const { sendProfileUpdated } = require("../services/email/emailService");
      sendProfileUpdated(user.email, user.name, ["Deleted an address"]);
    } catch (err) {
      console.error("Address delete email failed:", err.message);
    }

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Forgot Password Request
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400);
      throw new Error("Please provide your email address");
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account exists with this email, a reset link has been sent.",
      });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    const clientUrl = (process.env.CLIENT_URL || "http://localhost:3000").replace(/\/$/, "");
    const resetLink = `${clientUrl}/reset-password?token=${resetToken}`;
    
    const { sendPasswordReset } = require("../services/email/emailService");
    await sendPasswordReset(user.email, user.name, resetLink);

    res.status(200).json({
      success: true,
      message: "If an account exists with this email, a reset link has been sent.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset Password using token
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      res.status(400);
      throw new Error("Token and new password are required");
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select("+password");

    if (!user) {
      res.status(400);
      throw new Error("Invalid or expired reset token");
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    try {
      const { sendPasswordChanged } = require("../services/email/emailService");
      sendPasswordChanged(user.email, user.name, {
        date: new Date().toLocaleDateString("en-IN"),
        time: new Date().toLocaleTimeString("en-IN"),
      });
    } catch (err) {
      console.error("Password changed confirmation email failed:", err.message);
    }

    res.status(200).json({
      success: true,
      message: "Password reset successful. You can now log in.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send Email Verification OTP
 * @route   POST /api/auth/request-email-verification
 * @access  Private
 */
const requestEmailVerification = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email address is already verified.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    user.emailVerificationToken = hashedOtp;
    user.emailVerificationExpires = Date.now() + 600000; // 10 minutes

    await user.save();

    const { sendVerificationEmail } = require("../services/email/emailService");
    await sendVerificationEmail(user.email, user.name, otp);

    res.status(200).json({
      success: true,
      message: "Verification OTP code sent to your email address.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify Email OTP
 * @route   POST /api/auth/verify-email
 * @access  Private
 */
const verifyEmail = async (req, res, next) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      res.status(400);
      throw new Error("OTP code is required");
    }

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    const user = await User.findOne({
      _id: req.user._id,
      emailVerificationToken: hashedOtp,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400);
      throw new Error("Invalid or expired OTP verification code");
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email address verified successfully.",
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete Account
 * @route   DELETE /api/auth/delete-account
 * @access  Private
 */
const deleteAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    try {
      const { sendAccountDeleted } = require("../services/email/emailService");
      await sendAccountDeleted(user.email, user.name);
    } catch (err) {
      console.error("Account deleted email failed:", err.message);
    }

    await User.findByIdAndDelete(req.user._id);

    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.status(200).json({
      success: true,
      message: "Your account has been deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  requestPhoneOtp,
  verifyPhoneOtp,
  startGoogleAuth,
  completeGoogleAuth,
  getMe,
  logout,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  forgotPassword,
  resetPassword,
  requestEmailVerification,
  verifyEmail,
  deleteAccount,
};
