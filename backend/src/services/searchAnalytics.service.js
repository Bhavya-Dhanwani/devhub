import { SearchLog } from "../models/searchLog.model.js";
import { normalizeSearchQuery } from "../utils/normalizeSearchQuery.js";

export async function recordSearch({ query, resultCount = 0, user, source = "search" }) {
  const normalizedQuery = normalizeSearchQuery(query);

  if (normalizedQuery.length < 2) {
    return;
  }

  await SearchLog.create({
    query: normalizedQuery,
    user: user?.id || undefined,
    resultCount,
    source,
  });
}

export async function getTrendingSearches(limit = 10) {
  const logs = await SearchLog.aggregate([
    { $match: { query: { $ne: "" } } },
    { $group: { _id: "$query", count: { $sum: 1 }, lastSearchedAt: { $max: "$createdAt" } } },
    { $sort: { count: -1, lastSearchedAt: -1 } },
    { $limit: limit },
  ]);

  return logs.map((item) => ({ query: item._id, count: item.count }));
}

export async function getRecentSearches(user) {
  if (!user?.id) {
    return [];
  }

  const logs = await SearchLog.find({ user: user.id, query: { $ne: "" } })
    .sort({ createdAt: -1 })
    .limit(30)
    .select("query")
    .lean();
  const unique = [];

  for (const log of logs) {
    if (!unique.includes(log.query)) {
      unique.push(log.query);
    }

    if (unique.length === 10) {
      break;
    }
  }

  return unique;
}

export async function clearRecentSearches(user) {
  if (!user?.id) {
    return;
  }

  await SearchLog.deleteMany({ user: user.id, source: "search" });
}

export async function recordSearchClick({ blogId, position, query, slug, source, user }) {
  await SearchLog.create({
    blog: blogId || undefined,
    clickedSlug: slug || "",
    position: Number.isFinite(Number(position)) ? Number(position) : undefined,
    query: normalizeSearchQuery(query),
    source: source || "search",
    user: user?.id || undefined,
  });
}
