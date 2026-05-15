import { Router } from "express";
import { z } from "zod";
import * as authController from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { uploadProfilePicture } from "../middleware/upload.middleware.js";
import { validateBody } from "../middleware/validate.js";

const router = Router();

const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.string().trim().email("Enter a valid email address.").toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").toLowerCase(),
  password: z.string().min(1, "Password is required."),
});

const otpSchema = z.object({
  otp: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit OTP."),
});

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").toLowerCase(),
  clientUrl: z.string().trim().url().optional().default("http://localhost:3000"),
});

const resetPasswordSchema = z.object({
  token: z.string().trim().min(20, "Reset token is required."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

router.post("/signup", uploadProfilePicture, validateBody(signupSchema), authController.signup);
router.post("/login", validateBody(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", authenticate, authController.me);
router.post("/verify-email", authenticate, validateBody(otpSchema), authController.verifyEmail);
router.post("/resend-verification-otp", authenticate, authController.resendEmailVerificationOtp);
router.post("/forgot-password", validateBody(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", validateBody(resetPasswordSchema), authController.resetPassword);

export default router;
