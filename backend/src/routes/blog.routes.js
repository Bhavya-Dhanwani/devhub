import { Router } from "express";
import {
  createBlogController,
  deleteBlogController,
  getAllBlogsController,
  getBlogBySlugController,
  getBookmarkedBlogsController,
  getBlogSocialStateController,
  getBlogsByUserController,
  getMyBlogByIdController,
  getMyBlogsController,
  incrementBlogViewController,
  toggleBlogBookmarkController,
  updateBlogContentTypeController,
  updateBlogLikeController,
  updateBlogController,
} from "../controllers/blog.controller.js";
import {
  createBlogCommentController,
  getBlogCommentsController,
  updateBlogCommentLikeController,
} from "../controllers/comment.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { optionalAuthenticate } from "../middleware/optionalAuth.middleware.js";
import { uploadBlogCover } from "../middleware/upload.middleware.js";
import { validateBody } from "../middleware/validate.js";
import { createBlogSchema, updateBlogSchema } from "../validators/blog.validator.js";

const router = Router();

router.use((req, _res, next) => {
  const routeContentType = req.baseUrl.endsWith("/projects") ? "project" : "blog";
  const requestedContentType = String(req.query.contentType || "").trim();
  const canUseRequestedContentType = req.method === "GET" && ["all", "blog", "project"].includes(requestedContentType);
  const contentType = canUseRequestedContentType ? requestedContentType : routeContentType;

  req.contentType = contentType === "all" ? routeContentType : contentType;
  req.query.contentType = contentType;
  next();
});

router.post("/", authenticate, uploadBlogCover, validateBody(createBlogSchema), createBlogController);
router.get("/", optionalAuthenticate, getAllBlogsController);
router.get("/me", authenticate, getMyBlogsController);
router.get("/me/:id", authenticate, getMyBlogByIdController);
router.get("/bookmarks", authenticate, getBookmarkedBlogsController);
router.get("/user/:userId", optionalAuthenticate, getBlogsByUserController);
router.patch("/:id", authenticate, uploadBlogCover, validateBody(updateBlogSchema), updateBlogController);
router.delete("/:id", authenticate, deleteBlogController);
router.patch("/:id/view", incrementBlogViewController);
router.get("/:id/social", optionalAuthenticate, getBlogSocialStateController);
router.patch("/:id/content-type", authenticate, updateBlogContentTypeController);
router.patch("/:id/like", authenticate, updateBlogLikeController);
router.patch("/:id/bookmark", authenticate, toggleBlogBookmarkController);
router.get("/:id/comments", optionalAuthenticate, getBlogCommentsController);
router.post("/:id/comments", authenticate, createBlogCommentController);
router.patch("/:id/comments/:commentId/like", authenticate, updateBlogCommentLikeController);
router.get("/:slug", optionalAuthenticate, getBlogBySlugController);

export default router;
