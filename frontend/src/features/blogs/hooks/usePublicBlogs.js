"use client";

import { useEffect, useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { blogsApi, projectsApi } from "../api/blogs.api";

function getContentApi(contentType = "blog") {
  return contentType === "project" ? projectsApi : blogsApi;
}

export function usePublicBlogs(params = {}) {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const stableParams = useMemo(
    () => params,
    [params.category, params.contentType, params.limit, params.search, params.sort, params.status, params.tag, params.tags],
  );
  const contentApi = getContentApi(stableParams.contentType);

  useEffect(() => {
    let isMounted = true;

    async function loadBlogs() {
      setIsLoading(true);
      setError("");

      try {
        const payload = await contentApi.getAll(stableParams);

        if (isMounted) {
          setBlogs(payload.blogs || []);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message || "Unable to load blogs.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadBlogs();

    return () => {
      isMounted = false;
    };
  }, [contentApi, stableParams]);

  return { blogs, error, isLoading };
}

export function useInfinitePublicBlogs(params = {}) {
  const stableParams = useMemo(
    () => params,
    [params.category, params.contentType, params.limit, params.search, params.sort, params.status, params.tag, params.tags],
  );
  const contentApi = getContentApi(stableParams.contentType);
  const limit = Math.min(Math.max(Number.parseInt(stableParams.limit, 10) || 20, 1), 50);
  const query = useInfiniteQuery({
    queryKey: ["public-content", stableParams],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      contentApi.getAll({
        ...stableParams,
        limit,
        skip: pageParam,
      }),
    getNextPageParam: (lastPage) => lastPage?.pagination?.nextSkip ?? undefined,
  });
  const blogs = query.data?.pages.flatMap((page) => page.blogs || []) || [];

  return {
    ...query,
    blogs,
  };
}
