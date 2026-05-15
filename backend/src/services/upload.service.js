import { cloudinary } from "../config/cloudinary.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";

export async function uploadImageBuffer(file, folder = "devhub/profile-pictures") {
  if (!file) {
    return "";
  }

  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new ApiError(500, "Cloudinary is not configured.");
  }

  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
    transformation: [{ width: 512, height: 512, crop: "fill", gravity: "face" }],
  });

  return result.secure_url;
}

export async function uploadImageToCloudinary(buffer, publicId, mimetype = "image/jpeg") {
  assertCloudinaryConfigured();

  try {
    const dataUri = `data:${mimetype};base64,${buffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "devhub/blogs",
      public_id: publicId,
      resource_type: "image",
      overwrite: false,
      transformation: [
        { width: 1600, height: 900, crop: "fill", quality: "auto", fetch_format: "auto" },
      ],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    if (error?.http_code === 409) {
      throw new ApiError(409, "Cloudinary image public ID already exists.");
    }

    throw new ApiError(500, "Cloudinary upload failed.");
  }
}

export async function deleteImageFromCloudinary(publicId) {
  if (!publicId) {
    return;
  }

  assertCloudinaryConfigured();

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch {
    throw new ApiError(500, "Cloudinary delete failed.");
  }
}

function assertCloudinaryConfigured() {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new ApiError(500, "Cloudinary is not configured.");
  }
}
