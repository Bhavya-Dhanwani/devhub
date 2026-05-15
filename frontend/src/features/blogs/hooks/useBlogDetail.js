"use client";

import { useEffect, useState } from "react";
import { getApiErrorMessage } from "@/core/api/apiClient";
import { blogsApi } from "../api/blogs.api";

export function useBlogDetail(identifier, options = {}) {
  const [blog, setBlog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadBlog() {
      setIsLoading(true);
      setError("");

      try {
        const nextBlog = options.preview
          ? await blogsApi.getMineById(identifier)
          : await blogsApi.getBySlug(identifier);

        if (isMounted) {
          setBlog(nextBlog);
        }

        if (!options.preview && nextBlog?._id) {
          blogsApi.addView(nextBlog._id).catch(() => {});
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

    if (identifier) {
      loadBlog();
    }

    return () => {
      isMounted = false;
    };
  }, [identifier, options.preview]);

  return { blog, error, isLoading };
}
