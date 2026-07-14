const express = require("express");
const { 
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
  deleteAccount
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const authSchemas = require("../schemas/auth.schemas");

const router = express.Router();

// Public routes
router.post("/register", validate(authSchemas.register), register);
router.post("/login", validate(authSchemas.login), login);
router.post("/phone/request-otp", validate(authSchemas.requestPhoneOtp), requestPhoneOtp);
router.post("/phone/verify-otp", validate(authSchemas.verifyPhoneOtp), verifyPhoneOtp);
router.get("/google", startGoogleAuth);
router.get("/google/callback", completeGoogleAuth);
router.post("/forgot-password", validate(authSchemas.forgotPassword), forgotPassword);
router.post("/reset-password", validate(authSchemas.resetPassword), resetPassword);

// Protected routes (requires valid token)
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.put("/profile", protect, validate(authSchemas.updateProfile), updateProfile);
router.post("/addresses", protect, validate(authSchemas.addAddress), addAddress);
router.put("/addresses/:id", protect, validate(authSchemas.addAddress), updateAddress);
router.delete("/addresses/:id", protect, deleteAddress);
router.post("/request-email-verification", protect, requestEmailVerification);
router.post("/verify-email", protect, validate(authSchemas.verifyEmail), verifyEmail);
router.delete("/delete-account", protect, deleteAccount);

module.exports = router;
