import bcrypt from "bcryptjs";
import crypto from "crypto";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String,
      default: "",
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    refreshTokenHash: {
      type: String,
      select: false,
      default: null,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationOtpHash: {
      type: String,
      select: false,
      default: null,
    },
    emailVerificationOtpExpiresAt: {
      type: Date,
      select: false,
      default: null,
    },
    passwordResetTokenHash: {
      type: String,
      select: false,
      default: null,
    },
    passwordResetExpiresAt: {
      type: Date,
      select: false,
      default: null,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.compareRefreshToken = function compareRefreshToken(token) {
  if (!this.refreshTokenHash) {
    return false;
  }

  return bcrypt.compare(token, this.refreshTokenHash);
};

userSchema.methods.setRefreshToken = async function setRefreshToken(token) {
  this.refreshTokenHash = await bcrypt.hash(token, 12);
};

userSchema.methods.setEmailVerificationOtp = async function setEmailVerificationOtp(otp) {
  this.emailVerificationOtpHash = await bcrypt.hash(otp, 12);
  this.emailVerificationOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
};

userSchema.methods.compareEmailVerificationOtp = function compareEmailVerificationOtp(otp) {
  if (!this.emailVerificationOtpHash) {
    return false;
  }

  return bcrypt.compare(otp, this.emailVerificationOtpHash);
};

userSchema.methods.createPasswordResetToken = function createPasswordResetToken() {
  const token = crypto.randomBytes(32).toString("hex");

  this.passwordResetTokenHash = crypto.createHash("sha256").update(token).digest("hex");
  this.passwordResetExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

  return token;
};

userSchema.statics.hashPasswordResetToken = function hashPasswordResetToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const User = mongoose.model("User", userSchema);
