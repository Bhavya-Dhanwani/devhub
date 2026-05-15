"use client";

import { useEffect, useMemo, useState } from "react";
import { blogsApi } from "../api/blogs.api";

export function usePublicBlogs(params = {}) {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const stableParams = useMemo(() => params, [params.limit, params.sort, params.status]);

  useEffect(() => {
    let isMounted = true;

    async function loadBlogs() {
      setIsLoading(true);
      setError("");

      try {
        const payload = await blogsApi.getAll(stableParams);

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
  }, [stableParams]);

  return { blogs, error, isLoading };
}
