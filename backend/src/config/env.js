import dotenv from "dotenv";

dotenv.config();

const required = ["MONGODB_URI", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

function assertJwtExpiresIn(key, value) {
  const normalized = value?.trim();
  const isPlainNumber = /^\d+$/.test(normalized || "");
  const isTimespan = /^\d+(ms|s|m|h|d|w|y)$/i.test(normalized || "");

  if (!normalized || (!isPlainNumber && !isTimespan)) {
    throw new Error(
      `Invalid environment variable ${key}: expected values like "15m", "1h", "7d", or seconds as a number.`,
    );
  }
}

assertJwtExpiresIn("ACCESS_TOKEN_EXPIRES_IN", process.env.ACCESS_TOKEN_EXPIRES_IN || "15m");
assertJwtExpiresIn("REFRESH_TOKEN_EXPIRES_IN", process.env.REFRESH_TOKEN_EXPIRES_IN || "7d");

export const env = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
  NODE_ENV: process.env.NODE_ENV || "development",
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  SENDER_EMAIL: process.env.SENDER_EMAIL || "onboarding@resend.dev",
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
};
