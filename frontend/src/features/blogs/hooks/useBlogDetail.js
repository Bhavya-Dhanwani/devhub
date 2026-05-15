"use client";

import { useEffect, useState } from "react";
import { getApiErrorMessage } from "@/core/api/apiClient";
import { blogsApi, projectsApi } from "../api/blogs.api";

function getContentApi(contentType = "blog") {
  return contentType === "project" ? projectsApi : blogsApi;
}

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
        const contentApi = getContentApi(options.contentType);
        const nextBlog = options.preview
          ? await contentApi.getMineById(identifier)
          : await getPublishedOrOwnedContent(contentApi, identifier, options.contentType);

        if (isMounted) {
          setBlog(nextBlog);
        }

        if (!options.preview && nextBlog?._id) {
          contentApi.addView(nextBlog._id).catch(() => {});
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
  }, [identifier, options.contentType, options.preview]);

  return { blog, error, isLoading };
}

async function getPublishedOrOwnedContent(contentApi, identifier, contentType) {
  try {
    return await contentApi.getById(identifier);
  } catch (error) {
    if (contentType !== "project") {
      throw error;
    }

    return contentApi.getMineById(identifier);
  }
}
