import { env } from "../config/env.js";

export const refreshCookieName = "refreshToken";

export function getRefreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "none",
    path: "/api/auth",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}
