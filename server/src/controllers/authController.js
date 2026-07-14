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

    // 5. Send response
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

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();
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

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      user: user.toSafeObject(),
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
};
