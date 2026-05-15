"use client";

import Link from "next/link";
import { BookText, Eye, MessageCircle, Plus } from "lucide-react";
import { useAppSelector } from "@/core/store/hooks";
import { AuthGuard } from "@/features/auth/ui/jsx/AuthGuard";
import { selectAuth } from "@/features/auth/state/authSlice";
import { AppSidebar } from "@/shared/components/layout/AppSidebar";
import { useUserBlogs } from "../../hooks/useUserBlogs";
import { WriterAuthPrompt } from "./WriterAuthPrompt";
import styles from "../css/BlogLibrary.module.css";

export function BlogLibraryPage({
  emptyDescription = "Create your first blog to get started with publishing.",
  emptyTitle = "No blogs yet",
  statusFilter = "all",
  title = "My Blogs",
}) {
  const { status } = useAppSelector(selectAuth);
  const { blogs, error, isLoading } = useUserBlogs({
    enabled: status === "authenticated",
    limit: 30,
    sort: "latest",
    status: statusFilter,
  });

  return (
    <AuthGuard fallback={<WriterAuthPrompt />} redirectToLogin={false}>
      <main className={styles.shell}>
        <AppSidebar collapsed />
        <section className={styles.content}>
          <header className={styles.header}>
            <h1>{title}</h1>
            <Link className={styles.newButton} href="/write/new">
              <Plus size={18} />
              New Blog
            </Link>
          </header>

          {isLoading ? (
            <section className={styles.statusState} role="status">
              <BookText size={28} />
              <p>Loading your blogs...</p>
            </section>
          ) : null}

          {!isLoading && error ? (
            <section className={styles.statusState} role="alert">
              <BookText size={28} />
              <p>{error}</p>
            </section>
          ) : null}

          {!isLoading && !error && blogs.length ? (
            <section className={styles.blogGrid}>
              {blogs.map((blog) => (
                <Link className={styles.blogCard} href={`/write/preview/${blog._id}`} key={blog._id}>
                  <div className={styles.blogMeta}>
                    <span>{blog.status}</span>
                    <span>{blog.category}</span>
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

          {!isLoading && !error && !blogs.length ? (
            <section className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <Plus size={34} />
              </div>
              <h2>{emptyTitle}</h2>
              <p>{emptyDescription}</p>
              <Link className={styles.createButton} href="/write/new">
                <Plus size={17} />
                Create your first blog
              </Link>
            </section>
          ) : null}
        </section>
      </main>
    </AuthGuard>
  );
}
