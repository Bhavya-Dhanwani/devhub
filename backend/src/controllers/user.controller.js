import * as userService from "../services/user.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const updateCurrentUserProfileController = asyncHandler(async (req, res) => {
  const payload = await userService.updateCurrentUserProfile({
    body: req.body,
    files: req.files,
    userId: req.user.id,
  });

  res.status(200).json(new ApiResponse(200, payload, "Profile updated successfully"));
});

export const followUserController = asyncHandler(async (req, res) => {
  const payload = await userService.followUser({
    targetUserId: req.params.userId,
    userId: req.user.id,
  });

  res.status(200).json(new ApiResponse(200, payload, "User followed successfully"));
});

export const unfollowUserController = asyncHandler(async (req, res) => {
  const payload = await userService.unfollowUser({
    targetUserId: req.params.userId,
    userId: req.user.id,
  });

  res.status(200).json(new ApiResponse(200, payload, "User unfollowed successfully"));
});

export const getFollowStatusController = asyncHandler(async (req, res) => {
  const payload = await userService.getFollowStatus({
    targetUserId: req.params.userId,
    userId: req.user?.id,
  });

  res.status(200).json(new ApiResponse(200, payload, "Follow status fetched successfully"));
});
