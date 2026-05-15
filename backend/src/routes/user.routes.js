import { Router } from "express";
import {
  followUserController,
  getFollowStatusController,
  unfollowUserController,
  updateCurrentUserProfileController,
} from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { optionalAuthenticate } from "../middleware/optionalAuth.middleware.js";
import { uploadProfileAssets } from "../middleware/upload.middleware.js";

const router = Router();

router.patch("/me", authenticate, uploadProfileAssets, updateCurrentUserProfileController);
router.get("/:userId/follow-status", optionalAuthenticate, getFollowStatusController);
router.post("/:userId/follow", authenticate, followUserController);
router.delete("/:userId/follow", authenticate, unfollowUserController);

export default router;
