export function errorHandler(error, _req, res, _next) {
  const isMulterError = error.name === "MulterError";
  const statusCode = error.statusCode || (isMulterError ? 400 : 500);
  const message = getErrorMessage(error, statusCode);

  if (statusCode === 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: error.errors || [],
  });
}

function getErrorMessage(error, statusCode) {
  if (error.name === "MulterError" && error.code === "LIMIT_FILE_SIZE") {
    return "Image must be smaller than 5MB.";
  }

  if (error.name === "MulterError") {
    return "Invalid upload request.";
  }

  return statusCode === 500 ? "Internal server error." : error.message;
}
