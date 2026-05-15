"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "@/core/api/apiClient";
import { blogsApi, projectsApi } from "../api/blogs.api";

export function useUserBlogs(params = {}) {
  const enabled = params.enabled !== false;
  const requestParams = useMemo(
    () => ({
      contentType: params.contentType,
      limit: params.limit,
      sort: params.sort,
      status: params.status,
    }),
    [params.contentType, params.limit, params.sort, params.status],
  );
  const [blogs, setBlogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBlogs = useCallback(async () => {
    if (!enabled) {
      setBlogs([]);
      setPagination(null);
      setStats(null);
      setIsLoading(false);
      setError("");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const payload = await loadMine(requestParams);
      setBlogs(normalizeContent(payload.blogs));
      setPagination(payload.pagination || null);
      setStats(normalizeStats(payload.stats));
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [enabled, requestParams]);

  useEffect(() => {
    let isMounted = true;

    async function guardedLoad() {
      if (!enabled) {
        setBlogs([]);
        setPagination(null);
        setStats(null);
        setIsLoading(false);
        setError("");
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const payload = await loadMine(requestParams);

        if (isMounted) {
          setBlogs(normalizeContent(payload.blogs));
          setPagination(payload.pagination || null);
          setStats(normalizeStats(payload.stats));
        }
      } catch (loadError) {
        if (isMounted) {
          setError(getApiErrorMessage(loadError));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    guardedLoad();

    return () => {
      isMounted = false;
    };
  }, [enabled, loadBlogs, requestParams]);

  return {
    blogs,
    error,
    isLoading,
    pagination,
    stats,
    reload: loadBlogs,
  };
}

async function loadMine(params) {
  if (params.contentType === "all") {
    return blogsApi.getMine(params);
  }

  if (params.contentType === "project") {
    return projectsApi.getMine(params);
  }

  return blogsApi.getMine(params);
}

function normalizeContent(blogs = []) {
  const contentById = new Map();

  for (const item of blogs) {
    if (!item?._id) {
      continue;
    }

    const current = contentById.get(String(item._id));
    const normalizedItem = {
      ...item,
      contentType: item.contentType === "project" ? "project" : "blog",
    };

    if (!current || normalizedItem.contentType === "project") {
      contentById.set(String(item._id), normalizedItem);
    }
  }

  return [...contentById.values()]
    .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime());
}

function normalizeStats(stats = {}) {
  return {
    blogs: stats.blogs || 0,
    drafts: stats.drafts || 0,
    posts: stats.posts || 0,
    projects: stats.projects || 0,
    totalComments: stats.totalComments || 0,
    totalLikes: stats.totalLikes || 0,
    totalViews: stats.totalViews || 0,
  };
}
