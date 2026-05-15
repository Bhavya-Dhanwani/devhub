"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "@/core/api/apiClient";
import { blogsApi } from "../api/blogs.api";

export function useUserBlogs(params = {}) {
  const enabled = params.enabled !== false;
  const requestParams = useMemo(
    () => ({
      limit: params.limit,
      sort: params.sort,
      status: params.status,
    }),
    [params.limit, params.sort, params.status],
  );
  const [blogs, setBlogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBlogs = useCallback(async () => {
    if (!enabled) {
      setBlogs([]);
      setPagination(null);
      setIsLoading(false);
      setError("");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const payload = await blogsApi.getMine(requestParams);
      setBlogs(payload.blogs || []);
      setPagination(payload.pagination || null);
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
        setIsLoading(false);
        setError("");
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const payload = await blogsApi.getMine(requestParams);

        if (isMounted) {
          setBlogs(payload.blogs || []);
          setPagination(payload.pagination || null);
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
    reload: loadBlogs,
  };
}
