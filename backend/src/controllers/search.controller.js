import * as searchService from "../services/search.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const searchBlogsController = asyncHandler(async (req, res) => {
  const payload = await searchService.searchBlogs(req.query, req.user);
  const message = payload.results.length ? "Blogs fetched successfully" : "No blogs found";

  res.status(200).json(new ApiResponse(200, payload, message));
});

export const getSuggestionsController = asyncHandler(async (req, res) => {
  const suggestions = await searchService.getSuggestions(req.query);

  res.status(200).json(new ApiResponse(200, { suggestions }, "Suggestions fetched successfully"));
});

export const getTrendingController = asyncHandler(async (_req, res) => {
  const trending = await searchService.getTrendingSearches();

  res.status(200).json(new ApiResponse(200, { trending }, "Trending searches fetched successfully"));
});

export const getRecentController = asyncHandler(async (req, res) => {
  const recent = await searchService.getRecentSearches(req.user);

  res.status(200).json(new ApiResponse(200, { recent }, "Recent searches fetched successfully"));
});

export const clearRecentController = asyncHandler(async (req, res) => {
  await searchService.clearRecentSearches(req.user);

  res.status(200).json(new ApiResponse(200, { recent: [] }, "Recent searches cleared successfully"));
});

export const trackClickController = asyncHandler(async (req, res) => {
  await searchService.trackClick(req.body, req.user);

  res.status(200).json(new ApiResponse(200, {}, "Search click tracked successfully"));
});
