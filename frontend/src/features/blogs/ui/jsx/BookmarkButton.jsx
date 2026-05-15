"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/core/api/apiClient";
import { useAppSelector } from "@/core/store/hooks";
import { selectAuth } from "@/features/auth/state/authSlice";
import { blogsApi, projectsApi } from "../../api/blogs.api";
import { notifyBlogSocialChanged } from "../../lib/socialEvents";
import styles from "../css/SearchBookmarks.module.css";

export function BookmarkButton({ blog, className = "", contentType = "blog" }) {
  const normalizedContentType = contentType === "project" || blog?.contentType === "project" ? "project" : "blog";
  const contentApi = normalizedContentType === "project" ? projectsApi : blogsApi;
  const router = useRouter();
  const { status } = useAppSelector(selectAuth);
  const [isBookmarked, setIsBookmarked] = useState(Boolean(blog.isBookmarked));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadSocialState() {
      if (status !== "authenticated" || !blog._id) {
        setIsBookmarked(false);
        return;
      }

      if (typeof blog.isBookmarked === "boolean") {
        setIsBookmarked(blog.isBookmarked);
        return;
      }

      try {
        const payload = await contentApi.getSocialState(blog._id);

        if (isMounted) {
          setIsBookmarked(Boolean(payload.isBookmarked));
        }
      } catch {
        if (isMounted) {
          setIsBookmarked(false);
        }
      }
    }

    loadSocialState();

    return () => {
      isMounted = false;
    };
  }, [blog._id, blog.isBookmarked, contentApi, status]);

  const onToggleBookmark = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (status !== "authenticated") {
      router.push("/login");
      return;
    }

    if (isSaving) {
      return;
    }

    const nextBookmarked = !isBookmarked;
    const previousBookmarked = isBookmarked;
    setIsBookmarked(nextBookmarked);
    setIsSaving(true);

    try {
      const payload = await contentApi.updateBookmark(blog._id, nextBookmarked);
      setIsBookmarked(Boolean(payload.isBookmarked));
      notifyBlogSocialChanged({ blogId: blog._id, isBookmarked: Boolean(payload.isBookmarked) });
    } catch (error) {
      setIsBookmarked(previousBookmarked);
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <button
      className={`${styles.bookmarkButton} ${isBookmarked ? styles.bookmarkButtonActive : ""} ${className}`.trim()}
      type="button"
      aria-label={isBookmarked ? "Remove bookmark" : "Save bookmark"}
      aria-pressed={isBookmarked}
      disabled={isSaving}
      onClick={onToggleBookmark}
    >
      <Bookmark size={17} />
    </button>
  );
}
