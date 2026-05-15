import { Blog } from "../models/Blog.js";
import { User } from "../models/user.model.js";
import {
  buildSearchCountPipeline,
  buildSearchPipeline,
} from "../utils/buildSearchPipeline.js";
import {
  sanitizeSearchInput,
  sanitizeSuggestionInput,
} from "../utils/sanitizeSearchInput.js";
import * as searchAnalytics from "./searchAnalytics.service.js";

export async function searchBlogs(rawQuery, user) {
  const startedAt = Date.now();
  const params = sanitizeSearchInput(rawQuery);

  const [results, countRows] = await Promise.all([
    Blog.aggregate(buildSearchPipeline(params)),
    Blog.aggregate(buildSearchCountPipeline(params)),
  ]);

  const total = countRows[0]?.total || 0;
  const hydratedResults = await addViewerState(results, user?.id);
  const payload = buildSearchPayload({
    filters: params,
    results: hydratedResults,
    searchTimeMs: Date.now() - startedAt,
    total,
  });

  await searchAnalytics.recordSearch({
    query: params.q,
    resultCount: total,
    user,
    source: "search",
  });

  return payload;
}

export async function getSuggestions(rawQuery) {
  const params = sanitizeSuggestionInput(rawQuery);

  if (params.q.length < 2) {
    return [];
  }

  const blogs = await Blog.find({
    status: "published",
    title: {
      $regex: `^${escapeRegExp(params.q)}`,
      $options: "i",
    },
  })
    .select("title slug")
    .sort({ views: -1, likesCount: -1, createdAt: -1 })
    .limit(params.limit)
    .lean();

  return blogs.map((blog) => ({
    title: blog.title,
    slug: blog.slug,
  }));
}

export async function getTrendingSearches() {
  return searchAnalytics.getTrendingSearches(10);
}

export async function getRecentSearches(user) {
  return searchAnalytics.getRecentSearches(user);
}

export async function clearRecentSearches(user) {
  await searchAnalytics.clearRecentSearches(user);
}

export async function trackClick(body, user) {
  await searchAnalytics.recordSearchClick({
    blogId: body.blogId,
    position: body.position,
    query: body.query,
    slug: body.slug,
    source: body.source,
    user,
  });
}

function buildSearchPayload({ filters, results, searchTimeMs, total }) {
  const totalPages = Math.ceil(total / filters.limit) || 0;

  return {
    results,
    blogs: results,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages,
      hasNextPage: filters.page < totalPages,
      hasPrevPage: filters.page > 1,
    },
    meta: {
      query: filters.q,
      sort: filters.sort,
      filters: {
        category: filters.category,
        tag: filters.tag,
      },
      searchTimeMs,
    },
  };
}

function escapeRegExp(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function addViewerState(results, userId) {
  if (!userId || !results.length) {
    return results;
  }

  const socialRows = await Blog.find({ _id: { $in: results.map((blog) => blog._id) } })
    .select("+likedBy +bookmarkedBy")
    .lean();
  const viewer = await User.findById(userId).select("following").lean();
  const followingIds = new Set((viewer?.following || []).map(String));
  const socialById = new Map(socialRows.map((blog) => [blog._id.toString(), blog]));

  return results.map((blog) => {
    const social = socialById.get(blog._id.toString());
    return {
      ...blog,
      isAuthorFollowed: followingIds.has(String(blog.author?._id || blog.author)),
      isBookmarked: isIdInList(social?.bookmarkedBy, userId),
      isLiked: isIdInList(social?.likedBy, userId),
    };
  });
}

function isIdInList(list = [], id) {
  return list.some((item) => String(item) === String(id));
}
