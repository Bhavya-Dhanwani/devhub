import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import * as mailService from "./mail.service.js";
import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} from "../utils/tokens.js";

function toAuthUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatar: user.avatar || "",
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function issueTokens(user) {
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  await user.setRefreshToken(refreshToken);
  await user.save();

  return { accessToken, refreshToken };
}

export async function signup({ name, email, password, avatar = "" }) {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists.");
  }

  const user = new User({ name, email, password, avatar });
  const otp = generateOtp();
  await user.setEmailVerificationOtp(otp);
  await user.save();
  await mailService.sendSignupOtpEmail({ to: user.email, name: user.name, otp });

  const tokens = await issueTokens(user);

  return { user: toAuthUser(user), ...tokens };
}

export async function login({ email, password }) {
  const user = await User.findOne({ email }).select("+password +refreshTokenHash");

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const tokens = await issueTokens(user);

  return { user: toAuthUser(user), ...tokens };
}

export async function refresh(refreshToken) {
  if (!refreshToken) {
    throw new ApiError(401, "Refresh token is missing.");
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, "Refresh token is invalid or expired.");
  }

  const user = await User.findById(payload.sub).select("+refreshTokenHash");

  if (!user || !(await user.compareRefreshToken(refreshToken))) {
    throw new ApiError(401, "Refresh token has been revoked.");
  }

  const tokens = await issueTokens(user);

  return { user: toAuthUser(user), ...tokens };
}

export async function logout(userId) {
  if (!userId) {
    return;
  }

  await User.findByIdAndUpdate(userId, { refreshTokenHash: null });
}

export async function logoutByRefreshToken(refreshToken) {
  if (!refreshToken) {
    return;
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    await logout(payload.sub);
  } catch {
    // Expired or malformed cookies should still be cleared by the controller.
  }
}

export async function getCurrentUser(userId) {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  return toAuthUser(user);
}

export async function verifyEmail(userId, otp) {
  const user = await User.findById(userId).select(
    "+emailVerificationOtpHash +emailVerificationOtpExpiresAt",
  );

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  if (user.isEmailVerified) {
    return toAuthUser(user);
  }

  const isExpired =
    !user.emailVerificationOtpExpiresAt || user.emailVerificationOtpExpiresAt.getTime() < Date.now();
  const isValid = await user.compareEmailVerificationOtp(otp);

  if (isExpired || !isValid) {
    throw new ApiError(400, "OTP is invalid or expired.");
  }

  user.isEmailVerified = true;
  user.emailVerificationOtpHash = null;
  user.emailVerificationOtpExpiresAt = null;
  await user.save();
  await mailService.sendWelcomeEmail({ to: user.email, name: user.name });

  return toAuthUser(user);
}

export async function resendEmailVerificationOtp(userId) {
  const user = await User.findById(userId).select(
    "+emailVerificationOtpHash +emailVerificationOtpExpiresAt",
  );

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  if (user.isEmailVerified) {
    return;
  }

  const otp = generateOtp();
  await user.setEmailVerificationOtp(otp);
  await user.save();
  await mailService.sendSignupOtpEmail({ to: user.email, name: user.name, otp });
}

export async function forgotPassword(email, clientUrl) {
  const user = await User.findOne({ email }).select("+passwordResetTokenHash +passwordResetExpiresAt");

  if (!user) {
    return;
  }

  const token = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${clientUrl}/reset-password?token=${token}`;
  await mailService.sendPasswordResetEmail({
    to: user.email,
    name: user.name,
    resetUrl,
  });
}

export async function resetPassword(token, password) {
  const tokenHash = User.hashPasswordResetToken(token);
  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpiresAt: { $gt: new Date() },
  }).select("+password +passwordResetTokenHash +passwordResetExpiresAt");

  if (!user) {
    throw new ApiError(400, "Password reset link is invalid or expired.");
  }

  user.password = password;
  user.passwordResetTokenHash = null;
  user.passwordResetExpiresAt = null;
  await user.save();
}
