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
          : await getPublishedOrOwnedContent(contentApi, identifier, options);

        if (isMounted) {
          setBlog(nextBlog);
        }

        if (!options.preview && nextBlog?._id) {
          contentApi.addView(nextBlog._id).catch(() => {});
        }
      } catch (loadError) {
        if (isMounted) {
          setError(getContentErrorMessage(loadError, options.contentType));
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
  }, [identifier, options.allowOwnerFallback, options.contentType, options.preview]);

  return { blog, error, isLoading };
}

function getContentErrorMessage(error, contentType) {
  const message = getApiErrorMessage(error);

  if (contentType === "project" && message.toLowerCase().includes("blog not found")) {
    return "Project not found. It may have been deleted or the link may be incorrect.";
  }

  return message;
}

async function getPublishedOrOwnedContent(contentApi, identifier, options) {
  try {
    return await contentApi.getById(identifier);
  } catch (error) {
    if (options.contentType !== "project" || !options.allowOwnerFallback) {
      throw error;
    }

    return contentApi.getMineById(identifier);
  }
}
