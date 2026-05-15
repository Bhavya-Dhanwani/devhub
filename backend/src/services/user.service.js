import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { deleteProfileImageFromCloudinaryUrl, uploadImageBuffer } from "./upload.service.js";

const editableUserSelect = "name username email avatar banner bio skills socialLinks portfolio followers following isEmailVerified createdAt updatedAt";

export async function updateCurrentUserProfile({ body, files, userId }) {
  const user = await User.findById(userId).select(editableUserSelect);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const name = sanitizeText(body.name, 80);
  const username = sanitizeUsername(body.username);
  const bio = sanitizeText(body.bio, 180);
  const avatarFile = files?.avatar?.[0];
  const bannerFile = files?.banner?.[0];

  if (name !== null) {
    if (name.length < 2) {
      throw new ApiError(400, "Name must be at least 2 characters.");
    }

    user.name = name;
  }

  if (username !== null) {
    if (username && username.length < 3) {
      throw new ApiError(400, "Username must be at least 3 characters.");
    }

    if (username) {
      const existingUser = await User.findOne({ username, _id: { $ne: userId } }).select("_id").lean();

      if (existingUser) {
        throw new ApiError(409, "Username is already taken.");
      }
    }

    user.username = username || undefined;
  }

  if (bio !== null) {
    user.bio = bio;
  }

  if (body.skills !== undefined) {
    user.skills = parseStringList(body.skills, 12, 32);
  }

  if (body.socialLinks !== undefined) {
    user.socialLinks = parseSocialLinks(body.socialLinks);
  }

  if (body.portfolio !== undefined) {
    user.portfolio = parsePortfolio(body.portfolio);
  }

  const previousAvatar = user.avatar;
  const previousBanner = user.banner;

  if (isTruthy(body.removeAvatar)) {
    user.avatar = "";
  } else if (avatarFile) {
    user.avatar = await uploadImageBuffer(avatarFile);
  }

  if (isTruthy(body.removeBanner)) {
    user.banner = "";
  } else if (bannerFile) {
    user.banner = await uploadImageBuffer(bannerFile, "devhub/profile-banners");
  }

  await user.save();

  await deleteReplacedProfileImage(previousAvatar, user.avatar);
  await deleteReplacedProfileImage(previousBanner, user.banner);

  return {
    user: toAuthUser(user),
  };
}

export async function followUser({ targetUserId, userId }) {
  assertValidUserPair({ targetUserId, userId });

  const targetUser = await User.findById(targetUserId).select("_id followers").lean();

  if (!targetUser) {
    throw new ApiError(404, "User not found.");
  }

  await Promise.all([
    User.updateOne(
      { _id: targetUserId },
      { $addToSet: { followers: userId } },
    ),
    User.updateOne(
      { _id: userId },
      { $addToSet: { following: targetUserId } },
    ),
  ]);

  return getFollowStatus({ targetUserId, userId });
}

export async function unfollowUser({ targetUserId, userId }) {
  assertValidUserPair({ targetUserId, userId });

  const targetUser = await User.findById(targetUserId).select("_id").lean();

  if (!targetUser) {
    throw new ApiError(404, "User not found.");
  }

  await Promise.all([
    User.updateOne(
      { _id: targetUserId },
      { $pull: { followers: userId } },
    ),
    User.updateOne(
      { _id: userId },
      { $pull: { following: targetUserId } },
    ),
  ]);

  return getFollowStatus({ targetUserId, userId });
}

export async function getFollowStatus({ targetUserId, userId }) {
  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    throw new ApiError(400, "Invalid user id.");
  }

  const targetUser = await User.findById(targetUserId)
    .select("followers following")
    .lean();

  if (!targetUser) {
    throw new ApiError(404, "User not found.");
  }

  const followerIds = (targetUser.followers || []).map(String);

  return {
    followersCount: followerIds.length,
    followingCount: targetUser.following?.length || 0,
    isFollowing: userId ? followerIds.includes(String(userId)) : false,
  };
}

function toAuthUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    username: user.username || "",
    email: user.email,
    avatar: user.avatar || "",
    banner: user.banner || "",
    bio: user.bio || "",
    skills: user.skills || [],
    socialLinks: user.socialLinks || {},
    portfolio: user.portfolio || [],
    isEmailVerified: user.isEmailVerified,
    followersCount: user.followers?.length || 0,
    followingCount: user.following?.length || 0,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function deleteReplacedProfileImage(previousUrl, nextUrl) {
  if (!previousUrl || previousUrl === nextUrl) {
    return;
  }

  try {
    await deleteProfileImageFromCloudinaryUrl(previousUrl);
  } catch (error) {
    console.warn("Failed to delete old profile image from Cloudinary:", error.message);
  }
}

function parseStringList(value, maxItems, maxLength) {
  const rawItems = parseJsonOrTextList(value);
  const uniqueItems = new Set();

  for (const item of rawItems) {
    const normalized = sanitizeText(item, maxLength);

    if (normalized) {
      uniqueItems.add(normalized);
    }
  }

  return [...uniqueItems].slice(0, maxItems);
}

function parseSocialLinks(value) {
  const links = parseJsonObject(value);
  const socialLinks = {
    github: sanitizeUrl(links.github),
    linkedin: sanitizeUrl(links.linkedin),
    website: sanitizeUrl(links.website),
    twitter: sanitizeUrl(links.twitter),
  };

  return Object.fromEntries(Object.entries(socialLinks).filter(([, link]) => link));
}

function parsePortfolio(value) {
  const items = Array.isArray(parseJsonObject(value)) ? parseJsonObject(value) : [];

  return items
    .map((item) => ({
      title: sanitizeText(item?.title, 80),
      description: sanitizeText(item?.description, 160),
      url: sanitizeUrl(item?.url),
    }))
    .filter((item) => item.title || item.description || item.url)
    .slice(0, 6);
}

function parseJsonOrTextList(value) {
  const parsed = parseJsonObject(value);

  if (Array.isArray(parsed)) {
    return parsed;
  }

  return String(value || "").split(/[\n,]+/);
}

function parseJsonObject(value) {
  if (typeof value !== "string") {
    return value || {};
  }

  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

function sanitizeUrl(value) {
  const url = sanitizeText(value, 300);

  if (!url) {
    return "";
  }

  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function isTruthy(value) {
  return value === true || value === "true" || value === "1";
}

function sanitizeText(value, maxLength) {
  if (value === undefined) {
    return null;
  }

  return String(value).trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function sanitizeUsername(value) {
  if (value === undefined) {
    return null;
  }

  const username = String(value).trim().toLowerCase();

  if (!username) {
    return "";
  }

  if (!/^[a-z0-9_]+$/.test(username)) {
    throw new ApiError(400, "Username can only use letters, numbers, and underscores.");
  }

  return username.slice(0, 32);
}

function assertValidUserPair({ targetUserId, userId }) {
  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    throw new ApiError(400, "Invalid user id.");
  }

  if (String(targetUserId) === String(userId)) {
    throw new ApiError(400, "You cannot follow yourself.");
  }
}
