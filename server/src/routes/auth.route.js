/**
 * auth.route.js
 * Routing for authentication APIs.
 */

const express = require("express");
const { register, login, requestPhoneOtp, verifyPhoneOtp, startGoogleAuth, completeGoogleAuth, getMe, logout, updateProfile, addAddress, updateAddress, deleteAddress } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/phone/request-otp", requestPhoneOtp);
router.post("/phone/verify-otp", verifyPhoneOtp);
router.get("/google", startGoogleAuth);
router.get("/google/callback", completeGoogleAuth);

// Protected routes (requires valid token)
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.post("/addresses", protect, addAddress);
router.put("/addresses/:id", protect, updateAddress);
router.delete("/addresses/:id", protect, deleteAddress);

module.exports = router;
