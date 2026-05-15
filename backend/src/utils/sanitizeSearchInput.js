import mongoose from "mongoose";
import { ApiError } from "./apiError.js";
import { normalizeSearchQuery } from "./normalizeSearchQuery.js";

const allowedSorts = new Set(["relevance", "latest", "popular", "most-liked", "most-commented"]);

export function sanitizeSearchInput(query = {}) {
  const q = normalizeSearchQuery(query.q || query.search).slice(0, 100);
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 10, 1), 50);
  const sort = allowedSorts.has(String(query.sort || "")) ? String(query.sort) : "relevance";
  const category = sanitizeFacetValue(query.category);
  const tag = sanitizeFacetValue(query.tag || query.tags);
  const authorId = sanitizeAuthorId(query.authorId);

  return {
    authorId,
    category,
    limit,
    page,
    q,
    sort,
    tag,
  };
}

export function sanitizeSuggestionInput(query = {}) {
  const q = normalizeSearchQuery(query.q || query.search).slice(0, 100);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 8, 1), 8);

  return { limit, q };
}

function sanitizeFacetValue(value) {
  if (!value) {
    return "";
  }

  return String(Array.isArray(value) ? value[0] : value)
    .trim()
    .replace(/^#+/, "")
    .replace(/[^\w\s.-]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 60);
}

function sanitizeAuthorId(value) {
  if (!value) {
    return "";
  }

  const authorId = String(Array.isArray(value) ? value[0] : value).trim();

  if (!mongoose.Types.ObjectId.isValid(authorId)) {
    throw new ApiError(400, "Invalid author id.");
  }

  return authorId;
}
