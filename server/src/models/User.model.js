/**
 * User.model.js
 * Represents a registered customer or admin on AuraBella.
 *
 * Key design decisions:
 *  - Password is stored hashed (bcryptjs) via a pre-save hook
 *  - comparePassword() is an instance method so controllers stay clean
 *  - Addresses are embedded (sub-documents) — typical for e-commerce
 *    where addresses change infrequently and are always loaded with the user
 *  - Wishlist is a reference array (ObjectId) to keep User docs lean
 *  - Indexes: unique email (login), role (admin-panel queries)
 */

const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const SALT_ROUNDS = 12;

// ── Address Sub-Schema ────────────────────────────────────────────────────────
const addressSchema = new mongoose.Schema(
  {
    label: {
      type:    String,
      trim:    true,
      default: "Home",            // e.g. "Home", "Office", "Other"
    },
    line1: {
      type:     String,
      required: [true, "Address line 1 is required"],
      trim:     true,
    },
    line2: {
      type:    String,
      trim:    true,
      default: "",
    },
    city: {
      type:     String,
      required: [true, "City is required"],
      trim:     true,
    },
    state: {
      type:     String,
      required: [true, "State is required"],
      trim:     true,
    },
    pincode: {
      type:      String,
      required:  [true, "Pincode is required"],
      trim:      true,
      validate: {
        validator: (v) => /^\d{6}$/.test(v),
        message:   "Pincode must be exactly 6 digits",
      },
    },
    phone: {
      type:     String,
      required: [true, "Phone number is required"],
      trim:     true,
      validate: {
        validator: (v) => /^\+?[\d\s\-()]{7,15}$/.test(v),
        message:   "Please provide a valid phone number",
      },
    },
    isDefault: {
      type:    Boolean,
      default: false,
    },
  },
  { _id: true }   // each address gets its own _id for easy CRUD
);

// ── User Schema ───────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    name: {
      type:      String,
      required:  [true, "Name is required"],
      trim:      true,
      minlength: [2,  "Name must be at least 2 characters"],
      maxlength: [60, "Name cannot exceed 60 characters"],
    },

    email: {
      type:      String,
      unique:    true,
      sparse:    true,
      lowercase: true,
      trim:      true,
      validate: {
        validator: (v) =>
          !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: "Please provide a valid email address",
      },
    },

    password: {
      type:      String,
      required:  [function () { return !this.googleId && !this.phone; }, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select:    false,         // never returned in queries by default
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      validate: {
        validator: (v) => !v || /^\+\d{8,15}$/.test(v),
        message: "Please provide a valid phone number with country code",
      },
    },

    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    phoneVerifiedAt: {
      type: Date,
      default: null,
    },

    role: {
      type:    String,
      enum:    {
        values:  ["customer", "admin"],
        message: "Role must be 'customer' or 'admin'",
      },
      default: "customer",
    },

    // Embedded address book — up to 5 addresses per user (enforced in controller)
    addresses: {
      type:    [addressSchema],
      default: [],
    },

    // Wishlist — array of Product refs (populated when needed)
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref:  "Product",
      },
    ],

    // Profile picture (Cloudinary URL)
    avatar: {
      type:    String,
      default: "",
    },

    // Email verification
    isVerified: {
      type:    Boolean,
      default: false,
    },

    // Password reset flow
    passwordResetToken:   { type: String, select: false },
    passwordResetExpires: { type: Date,   select: false },

    // Soft-delete / ban
    isActive: {
      type:    Boolean,
      default: true,
    },

    isBlocked: {
      type:    Boolean,
      default: false,
    },
  },
  {
    timestamps: true,   // adds createdAt + updatedAt automatically
    toJSON:    { virtuals: true },
    toObject:  { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// email is already indexed via unique:true above
userSchema.index({ role:     1 });   // admin dashboard filtering
userSchema.index({ isActive: 1 });   // soft-delete filtering
userSchema.index({ createdAt: -1 }); // sort newest users first

// ── Virtual: full display name (alias, same as name for now) ─────────────────
userSchema.virtual("displayName").get(function () {
  return this.name;
});

// ── Pre-save Hook: hash password ──────────────────────────────────────────────
userSchema.pre("save", async function (next) {
  // Only re-hash when the password field has actually been modified
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ── Instance Method: comparePassword ─────────────────────────────────────────
/**
 * Compares a plain-text candidate password against the stored hash.
 * Usage: const match = await user.comparePassword(req.body.password);
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Instance Method: sanitize (strip sensitive fields before sending) ─────────
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
