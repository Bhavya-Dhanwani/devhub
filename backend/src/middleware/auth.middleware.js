import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyAccessToken } from "../utils/tokens.js";

export const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    throw new ApiError(401, "Access token is missing.");
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw new ApiError(401, "Access token is invalid or expired.");
  }

  const user = await User.findById(payload.sub);

  if (!user) {
    throw new ApiError(401, "Authenticated user no longer exists.");
  }

  req.user = {
    id: user._id.toString(),
    email: user.email,
  };

  next();
});
