"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { BookText, Eye, MessageCircle } from "lucide-react";
import { AppSidebar } from "@/shared/components/layout/AppSidebar";
import { useInfinitePublicBlogs } from "../../hooks/usePublicBlogs";
import styles from "../css/BlogLibrary.module.css";

export function PublicBlogLibraryPage({ contentType = "blog" }) {
  const isProject = contentType === "project";
  const copy = isProject
    ? {
        empty: "No published projects yet",
        emptyDetail: "Published projects from all builders will show up here.",
        hrefBase: "/projects",
        loading: "Loading global projects...",
        newHref: "/projects/new",
        newLabel: "Add project",
        title: "Projects",
        subtitle: "Published projects from the whole DevHub community.",
      }
    : {
        empty: "No published blogs yet",
        emptyDetail: "Published posts from all writers will show up here.",
        hrefBase: "/blogs",
        loading: "Loading global blogs...",
        newHref: "/write/new",
        newLabel: "Write",
        title: "Blogs",
        subtitle: "Published posts from the whole DevHub community.",
      };
  const loadMoreRef = useRef(null);
  const {
    blogs,
    error,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
  } = useInfinitePublicBlogs({
    contentType,
    limit: 20,
    sort: "latest",
  });

  useEffect(() => {
    const marker = loadMoreRef.current;

    if (!marker || !hasNextPage || !window.IntersectionObserver) {
      return undefined;
    }

    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "360px 0px" },
    );

    observer.observe(marker);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <main className={styles.shell}>
      <AppSidebar collapsed />
      <section className={styles.content}>
        <header className={styles.header}>
          <div>
            <h1>{copy.title}</h1>
            <p>{copy.subtitle}</p>
          </div>
          <Link className={styles.newButton} href={copy.newHref}>
            {copy.newLabel}
          </Link>
        </header>

        {isLoading ? (
          <section className={styles.statusState} role="status">
            <BookText size={28} />
            <p>{copy.loading}</p>
          </section>
        ) : null}

        {!isLoading && isError ? (
          <section className={styles.statusState} role="alert">
            <BookText size={28} />
            <p>{error?.message || "Unable to load blogs."}</p>
          </section>
        ) : null}

        {!isLoading && !isError && blogs.length ? (
          <section className={styles.blogGrid}>
            {blogs.map((blog) => (
              <Link
                className={styles.blogCard}
                href={`${copy.hrefBase}/${isProject ? blog._id : blog.slug || blog._id}?from=${encodeURIComponent(copy.hrefBase)}`}
                key={blog._id}
              >
                <div className={styles.blogMeta}>
                  <span>{blog.category}</span>
                  <span>{blog.author?.name || "DevHub writer"}</span>
                </div>
                <h2>{blog.title}</h2>
                <p>{blog.excerpt || blog.subheading}</p>
                <div className={styles.blogStats}>
                  <span>
                    <BookText size={14} />
                    {blog.readTime || 1} min
                  </span>
                  <span>
                    <Eye size={14} />
                    {blog.views || 0}
                  </span>
                  <span>
                    <MessageCircle size={14} />
                    {blog.commentsCount || 0}
                  </span>
                </div>
              </Link>
            ))}
          </section>
        ) : null}

        {!isLoading && !isError && blogs.length && isFetchingNextPage ? (
          <section className={styles.skeletonGrid} aria-label="Loading more blogs">
            {Array.from({ length: 3 }).map((_, index) => (
              <article className={styles.skeletonCard} key={index}>
                <div className={styles.skeletonMeta}>
                  <span />
                  <span />
                </div>
                <div className={styles.skeletonTitle} />
                <div className={styles.skeletonText} />
                <div className={styles.skeletonTextShort} />
                <div className={styles.skeletonStats}>
                  <span />
                  <span />
                  <span />
                </div>
              </article>
            ))}
          </section>
        ) : null}

        {!isLoading && !isError && blogs.length ? (
          <div className={styles.loadMoreState} ref={loadMoreRef}>
            {hasNextPage ? <span className={styles.loadMoreDot} aria-hidden="true" /> : "You are all caught up"}
          </div>
        ) : null}

        {!isLoading && !isError && !blogs.length ? (
          <section className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <BookText size={34} />
            </div>
            <h2>{copy.empty}</h2>
            <p>{copy.emptyDetail}</p>
          </section>
        ) : null}
      </section>
    </main>
  );
}
