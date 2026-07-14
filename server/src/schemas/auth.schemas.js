/**
 * auth.schemas.js
 * Zod schemas for every auth-related request body.
 */

const { z } = require("zod");

// ─── Reusable field definitions ───────────────────────────────────────────────

const emailField = z
  .string({ required_error: "Email is required" })
  .trim()
  .toLowerCase()
  .email("Please provide a valid email address");

const passwordField = z
  .string({ required_error: "Password is required" })
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password cannot exceed 128 characters");

const nameField = z
  .string({ required_error: "Name is required" })
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(60, "Name cannot exceed 60 characters");

const phoneField = z
  .string()
  .trim()
  .regex(/^\+[\d\s\-()\d]{7,15}$/, "Phone must include country code, e.g. +91XXXXXXXXXX")
  .optional();

const pincodeField = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Pincode must be exactly 6 digits");

// ─── Auth Schemas ─────────────────────────────────────────────────────────────

const register = z.object({
  name:     nameField,
  email:    emailField,
  password: passwordField,
  phone:    phoneField,
});

const login = z.object({
  email:    emailField,
  password: z.string({ required_error: "Password is required" }).min(1, "Password is required"),
});

const forgotPassword = z.object({
  email: emailField,
});

const resetPassword = z.object({
  token:    z.string({ required_error: "Reset token is required" }).min(1),
  password: passwordField,
});

const updateProfile = z.object({
  name:   nameField.optional(),
  phone:  phoneField,
  avatar: z.string().url("Avatar must be a valid URL").optional().or(z.literal("")),
});

const addAddress = z.object({
  label:     z.string().trim().max(30).optional().default("Home"),
  line1:     z.string({ required_error: "Address line 1 is required" }).trim().min(3, "Address line 1 is too short"),
  line2:     z.string().trim().optional().default(""),
  city:      z.string({ required_error: "City is required" }).trim().min(2),
  state:     z.string({ required_error: "State is required" }).trim().min(2),
  pincode:   pincodeField,
  phone:     z.string({ required_error: "Phone is required" }).trim().min(7, "Phone number is too short"),
  isDefault: z.boolean().optional().default(false),
});

const requestPhoneOtp = z.object({
  phone: z
    .string({ required_error: "Phone number is required" })
    .trim()
    .regex(/^\+[\d]{8,15}$/, "Phone must include country code, e.g. +91XXXXXXXXXX"),
});

const verifyPhoneOtp = z.object({
  phone: z
    .string({ required_error: "Phone number is required" })
    .trim()
    .regex(/^\+[\d]{8,15}$/, "Phone must include country code"),
  otp: z
    .string({ required_error: "OTP is required" })
    .trim()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only digits"),
});

const verifyEmail = z.object({
  token: z.string({ required_error: "Verification token is required" }).min(1),
});

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  updateProfile,
  addAddress,
  requestPhoneOtp,
  verifyPhoneOtp,
  verifyEmail,
};
