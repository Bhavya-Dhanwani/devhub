import * as authService from "../services/auth.service.js";
import * as uploadService from "../services/upload.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getRefreshCookieOptions, refreshCookieName } from "../utils/cookies.js";

function sendAuthResponse(res, statusCode, payload) {
  res
    .status(statusCode)
    .cookie(refreshCookieName, payload.refreshToken, getRefreshCookieOptions())
    .json({
      user: payload.user,
      accessToken: payload.accessToken,
    });
}

export const signup = asyncHandler(async (req, res) => {
  const avatar = await uploadService.uploadImageBuffer(req.file);
  const payload = await authService.signup({ ...req.body, avatar });
  sendAuthResponse(res, 201, payload);
});

export const login = asyncHandler(async (req, res) => {
  const payload = await authService.login(req.body);
  sendAuthResponse(res, 200, payload);
});

export const refresh = asyncHandler(async (req, res) => {
  const payload = await authService.refresh(req.cookies[refreshCookieName]);
  sendAuthResponse(res, 200, payload);
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logoutByRefreshToken(req.cookies[refreshCookieName]);

  res
    .clearCookie(refreshCookieName, getRefreshCookieOptions())
    .json({ message: "Logged out successfully." });
});

export const me = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);
  res.json({ user });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const user = await authService.verifyEmail(req.user.id, req.body.otp);
  res.json({ user, message: "Email verified successfully." });
});

export const resendEmailVerificationOtp = asyncHandler(async (req, res) => {
  await authService.resendEmailVerificationOtp(req.user.id);
  res.json({ message: "Verification OTP sent." });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email, req.body.clientUrl);
  res.json({
    message: "If that email exists, a password reset link has been sent.",
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body.token, req.body.password);
  res.json({ message: "Password reset successfully." });
});
