import * as blogService from "../services/blog.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createBlogController = asyncHandler(async (req, res) => {
  const blog = await blogService.createBlogService({
    body: req.body,
    file: req.file,
    userId: req.user.id,
  });

  res.status(201).json(new ApiResponse(201, { blog }, "Blog created successfully"));
});

export const getAllBlogsController = asyncHandler(async (req, res) => {
  const payload = await blogService.getAllBlogsService(req.query);

  res.status(200).json(new ApiResponse(200, payload, "Blogs fetched successfully"));
});

export const getBlogBySlugController = asyncHandler(async (req, res) => {
  const blog = await blogService.getBlogBySlugService(req.params.slug);

  res.status(200).json(new ApiResponse(200, { blog }, "Blog fetched successfully"));
});

export const getMyBlogByIdController = asyncHandler(async (req, res) => {
  const blog = await blogService.getMyBlogByIdService({
    blogId: req.params.id,
    userId: req.user.id,
  });

  res.status(200).json(new ApiResponse(200, { blog }, "Blog fetched successfully"));
});

export const getBlogsByUserController = asyncHandler(async (req, res) => {
  const payload = await blogService.getBlogsByUserService({
    userId: req.params.userId,
    query: req.query,
  });

  res.status(200).json(new ApiResponse(200, payload, "User blogs fetched successfully"));
});

export const getMyBlogsController = asyncHandler(async (req, res) => {
  const payload = await blogService.getMyBlogsService({
    userId: req.user.id,
    query: req.query,
  });

  res.status(200).json(new ApiResponse(200, payload, "Your blogs fetched successfully"));
});

export const updateBlogController = asyncHandler(async (req, res) => {
  const blog = await blogService.updateBlogService({
    blogId: req.params.id,
    body: req.body,
    file: req.file,
    userId: req.user.id,
  });

  res.status(200).json(new ApiResponse(200, { blog }, "Blog updated successfully"));
});

export const deleteBlogController = asyncHandler(async (req, res) => {
  await blogService.deleteBlogService({
    blogId: req.params.id,
    userId: req.user.id,
  });

  res.status(200).json(new ApiResponse(200, {}, "Blog deleted successfully"));
});

export const incrementBlogViewController = asyncHandler(async (req, res) => {
  await blogService.incrementBlogViewService(req.params.id);

  res.status(200).json(new ApiResponse(200, {}, "View added successfully"));
});
