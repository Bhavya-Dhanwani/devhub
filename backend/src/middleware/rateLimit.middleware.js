import { ApiError } from "../utils/apiError.js";

export function createRateLimiter({ limit = 100, windowMs = 60_000 } = {}) {
  const buckets = new Map();

  return (req, _res, next) => {
    const now = Date.now();
    const key = req.ip || req.headers["x-forwarded-for"] || "unknown";
    const bucket = buckets.get(key) || { count: 0, resetAt: now + windowMs };

    if (bucket.resetAt <= now) {
      bucket.count = 0;
      bucket.resetAt = now + windowMs;
    }

    bucket.count += 1;
    buckets.set(key, bucket);

    if (bucket.count > limit) {
      next(new ApiError(429, "Too many search requests. Please try again in a minute."));
      return;
    }

    next();
  };
}
