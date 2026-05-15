import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyAccessToken } from "../utils/tokens.js";

export const optionalAuthenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    next();
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).select("email").lean();

    if (user) {
      req.user = {
        id: user._id.toString(),
        email: user.email,
      };
    }
  } catch {
    // Public search should still work if a stale token is present.
  }

  next();
});
