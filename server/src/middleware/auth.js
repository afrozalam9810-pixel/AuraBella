/**
 * auth.js
 * Middleware to authenticate requests using JWT.
 * Checks for token in HTTP-only cookies or Authorization Bearer header.
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

const protect = async (req, res, next) => {
  let token;

  // 1. Get token from Authorization header or cookie
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // 2. Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this resource. Please log in.",
    });
  }

  try {
    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Get user from the database (excluding password)
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "The user belonging to this token no longer exists.",
      });
    }

    if (!user.isActive || user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "This account has been deactivated or blocked.",
      });
    }

    // Attach user to req object
    req.user = user;
    next();
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    
    let message = "Not authorized, token failed";
    if (error.name === "TokenExpiredError") {
      message = "Your session has expired. Please log in again.";
    }

    return res.status(401).json({
      success: false,
      message,
    });
  }
};

module.exports = { protect };
