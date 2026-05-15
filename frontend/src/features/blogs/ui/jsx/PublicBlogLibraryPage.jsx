"use client";

import Link from "next/link";
import { BookText, Eye, MessageCircle } from "lucide-react";
import { AppSidebar } from "@/shared/components/layout/AppSidebar";
import { usePublicBlogs } from "../../hooks/usePublicBlogs";
import styles from "../css/BlogLibrary.module.css";

export function PublicBlogLibraryPage() {
  const { blogs, error, isLoading } = usePublicBlogs({
    limit: 50,
    sort: "latest",
  });

  return (
    <main className={styles.shell}>
      <AppSidebar collapsed />
      <section className={styles.content}>
        <header className={styles.header}>
          <div>
            <h1>Blogs</h1>
            <p>Published posts from the whole DevHub community.</p>
          </div>
          <Link className={styles.newButton} href="/write/new">
            Write
          </Link>
        </header>

        {isLoading ? (
          <section className={styles.statusState} role="status">
            <BookText size={28} />
            <p>Loading global blogs...</p>
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
              <Link className={styles.blogCard} href={`/blogs/${blog.slug}`} key={blog._id}>
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

        {!isLoading && !error && !blogs.length ? (
          <section className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <BookText size={34} />
            </div>
            <h2>No published blogs yet</h2>
            <p>Published posts from all writers will show up here.</p>
          </section>
        ) : null}
      </section>
    </main>
  );
}
