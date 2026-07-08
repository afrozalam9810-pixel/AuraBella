/**
 * authController.js
 * Controller handling user registration, login, logout, and profile retrieval.
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

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
    expires: new Date(Date.now() + cookieExpiryDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
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
    if (!user) {
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
  getMe,
  logout,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
};
