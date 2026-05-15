import * as commentService from "../services/comment.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getBlogCommentsController = asyncHandler(async (req, res) => {
  const payload = await commentService.getBlogCommentsService({
    blogId: req.params.id,
    query: req.query,
    userId: req.user?.id,
  });

  res.status(200).json(new ApiResponse(200, payload, "Comments fetched successfully"));
});

export const createBlogCommentController = asyncHandler(async (req, res) => {
  const payload = await commentService.createBlogCommentService({
    blogId: req.params.id,
    body: req.body,
    userId: req.user.id,
  });

  res.status(201).json(new ApiResponse(201, payload, "Comment created successfully"));
});

export const updateBlogCommentLikeController = asyncHandler(async (req, res) => {
  const payload = await commentService.updateBlogCommentLikeService({
    blogId: req.params.id,
    commentId: req.params.commentId,
    liked: Boolean(req.body.liked),
    userId: req.user.id,
  });

  res.status(200).json(new ApiResponse(200, payload, "Comment like updated successfully"));
});
