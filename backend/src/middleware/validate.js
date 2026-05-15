import { ApiError } from "../utils/apiError.js";

export function validateBody(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      throw new ApiError(400, result.error.issues[0]?.message || "Invalid request body.");
    }

    req.body = result.data;
    next();
  };
}
