import * as blogService from "../services/blog.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createBlogController = asyncHandler(async (req, res) => {
  const blog = await blogService.createBlogService({
    body: req.body,
    contentType: req.contentType,
    file: req.file,
    userId: req.user.id,
  });

  res.status(201).json(new ApiResponse(201, { blog }, "Blog created successfully"));
});

export const getAllBlogsController = asyncHandler(async (req, res) => {
  const payload = await blogService.getAllBlogsService(withRouteContentType(req), req.user);

  res.status(200).json(new ApiResponse(200, payload, "Blogs fetched successfully"));
});

export const getBlogBySlugController = asyncHandler(async (req, res) => {
  const blog = await blogService.getBlogBySlugService(req.params.slug, req.user, withRouteContentType(req));

  res.status(200).json(new ApiResponse(200, { blog }, "Blog fetched successfully"));
});

export const getMyBlogByIdController = asyncHandler(async (req, res) => {
  const blog = await blogService.getMyBlogByIdService({
    blogId: req.params.id,
    contentType: req.contentType,
    userId: req.user.id,
  });

  res.status(200).json(new ApiResponse(200, { blog }, "Blog fetched successfully"));
});

export const getBlogsByUserController = asyncHandler(async (req, res) => {
  const payload = await blogService.getBlogsByUserService({
    userId: req.params.userId,
    query: withRouteContentType(req),
    viewer: req.user,
  });

  res.status(200).json(new ApiResponse(200, payload, "User blogs fetched successfully"));
});

export const getMyBlogsController = asyncHandler(async (req, res) => {
  const payload = await blogService.getMyBlogsService({
    userId: req.user.id,
    query: withRouteContentType(req),
  });

  res.status(200).json(new ApiResponse(200, payload, "Your blogs fetched successfully"));
});

export const updateBlogController = asyncHandler(async (req, res) => {
  const blog = await blogService.updateBlogService({
    blogId: req.params.id,
    body: req.body,
    contentType: req.contentType,
    file: req.file,
    userId: req.user.id,
  });

  res.status(200).json(new ApiResponse(200, { blog }, "Blog updated successfully"));
});

export const deleteBlogController = asyncHandler(async (req, res) => {
  await blogService.deleteBlogService({
    blogId: req.params.id,
    contentType: req.contentType,
    userId: req.user.id,
  });

  res.status(200).json(new ApiResponse(200, {}, "Blog deleted successfully"));
});

export const incrementBlogViewController = asyncHandler(async (req, res) => {
  await blogService.incrementBlogViewService(req.params.id, req.contentType);

  res.status(200).json(new ApiResponse(200, {}, "View added successfully"));
});

export const updateBlogLikeController = asyncHandler(async (req, res) => {
  const payload = await blogService.updateBlogLikeService({
    blogId: req.params.id,
    contentType: req.contentType,
    liked: Boolean(req.body.liked),
    userId: req.user.id,
  });

  res.status(200).json(new ApiResponse(200, payload, "Like updated successfully"));
});

export const getBlogSocialStateController = asyncHandler(async (req, res) => {
  const payload = await blogService.getBlogSocialStateService({
    blogId: req.params.id,
    contentType: req.contentType,
    userId: req.user?.id,
  });

  res.status(200).json(new ApiResponse(200, payload, "Blog social state fetched successfully"));
});

export const toggleBlogBookmarkController = asyncHandler(async (req, res) => {
  const payload = await blogService.updateBlogBookmarkService({
    blogId: req.params.id,
    bookmarked: Boolean(req.body.bookmarked),
    contentType: req.contentType,
    userId: req.user.id,
  });

  res.status(200).json(new ApiResponse(200, payload, "Bookmark updated successfully"));
});

export const updateBlogContentTypeController = asyncHandler(async (req, res) => {
  const blog = await blogService.updateBlogContentTypeService({
    blogId: req.params.id,
    contentType: req.body.contentType,
    userId: req.user.id,
  });

  res.status(200).json(new ApiResponse(200, { blog }, "Content type updated successfully"));
});

export const getBookmarkedBlogsController = asyncHandler(async (req, res) => {
  const payload = await blogService.getBookmarkedBlogsService({
    query: withRouteContentType(req),
    userId: req.user.id,
  });

  res.status(200).json(new ApiResponse(200, payload, "Bookmarks fetched successfully"));
});

function withRouteContentType(req) {
  return {
    ...req.query,
    contentType: req.contentType,
  };
}
