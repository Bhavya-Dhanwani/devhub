"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { getApiErrorMessage } from "@/core/api/apiClient";
import { useAppSelector } from "@/core/store/hooks";
import { selectAuth } from "@/features/auth/state/authSlice";
import { AppSidebar } from "@/shared/components/layout/AppSidebar";
import { blogsApi } from "../../api/blogs.api";
import { blogSocialChangedEvent } from "../../lib/socialEvents";
import { BlogResultGrid } from "./BlogResultGrid";
import styles from "../css/SearchBookmarks.module.css";

export function BookmarksPage() {
  const { status } = useAppSelector(selectAuth);
  const [blogs, setBlogs] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(status === "authenticated");

  useEffect(() => {
    let isMounted = true;

    async function loadBookmarks() {
      if (status !== "authenticated") {
        setBlogs([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const payload = await blogsApi.getBookmarks({ limit: 50 });

        if (isMounted) {
          setBlogs(payload.blogs || []);
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

    loadBookmarks();
    window.addEventListener(blogSocialChangedEvent, loadBookmarks);

    return () => {
      isMounted = false;
      window.removeEventListener(blogSocialChangedEvent, loadBookmarks);
    };
  }, [status]);

  return (
    <main className={styles.shell}>
      <AppSidebar collapsed />
      <section className={styles.content}>
        <header className={styles.header}>
          <p>Saved</p>
          <h1>Bookmarks</h1>
          <div className={styles.headerNote}>
            <Bookmark size={18} />
            <span>Blogs you save are stored with your DevHub account.</span>
          </div>
        </header>

        {status !== "authenticated" ? (
          <section className={styles.emptyState}>
            <Bookmark size={34} />
            <p>Please sign in to view saved blogs.</p>
            <Link href="/login">Sign in</Link>
          </section>
        ) : (
          <BlogResultGrid
            backHref="/bookmarks"
            blogs={blogs}
            emptyText="No bookmarks yet. Save a blog and it will appear here."
            error={error}
            isLoading={isLoading}
            loadingText="Loading bookmarks..."
          />
        )}
      </section>
    </main>
  );
}
