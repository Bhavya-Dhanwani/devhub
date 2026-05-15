import multer from "multer";
import { ApiError } from "../utils/apiError.js";

const storage = multer.memoryStorage();
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/jpg"]);

function imageFileFilter(_req, file, cb) {
  if (!allowedImageTypes.has(file.mimetype)) {
    cb(new ApiError(400, "Only JPEG, PNG, JPG, and WEBP images are allowed."));
    return;
  }

  cb(null, true);
}

export const uploadProfilePicture = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
}).single("avatar");

export const uploadBlogCover = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fieldSize: 15 * 1024 * 1024,
    fileSize: 5 * 1024 * 1024,
  },
}).single("coverImage");
