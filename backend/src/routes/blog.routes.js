import { Router } from "express";
import {
  createBlogController,
  deleteBlogController,
  getAllBlogsController,
  getBlogBySlugController,
  getBlogsByUserController,
  getMyBlogByIdController,
  getMyBlogsController,
  incrementBlogViewController,
  updateBlogController,
} from "../controllers/blog.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { uploadBlogCover } from "../middleware/upload.middleware.js";
import { validateBody } from "../middleware/validate.js";
import { createBlogSchema, updateBlogSchema } from "../validators/blog.validator.js";

const router = Router();

router.post("/", authenticate, uploadBlogCover, validateBody(createBlogSchema), createBlogController);
router.get("/", getAllBlogsController);
router.get("/me", authenticate, getMyBlogsController);
router.get("/me/:id", authenticate, getMyBlogByIdController);
router.get("/user/:userId", getBlogsByUserController);
router.patch("/:id", authenticate, uploadBlogCover, validateBody(updateBlogSchema), updateBlogController);
router.delete("/:id", authenticate, deleteBlogController);
router.patch("/:id/view", incrementBlogViewController);
router.get("/:slug", getBlogBySlugController);

export default router;
