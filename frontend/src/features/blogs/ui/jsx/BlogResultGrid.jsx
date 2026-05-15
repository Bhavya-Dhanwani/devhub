import Image from "next/image";
import Link from "next/link";
import { BookText, Code2, Eye, Heart, MessageCircle } from "lucide-react";
import { searchApi } from "../../api/search.api";
import { BookmarkButton } from "./BookmarkButton";
import styles from "../css/SearchBookmarks.module.css";

export function BlogResultGrid({
  backHref = "",
  blogs = [],
  emptyText,
  error = "",
  isLoading,
  loadingText,
  query = "",
  source = "",
}) {
  if (isLoading) {
    return (
      <section className={styles.statusState} role="status">
        <BookText size={28} />
        <p>{loadingText}</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.statusState} role="alert">
        <BookText size={28} />
        <p>{error}</p>
      </section>
    );
  }

  if (!blogs.length) {
    return (
      <section className={styles.emptyState}>
        <BookText size={34} />
        <p>{emptyText}</p>
      </section>
    );
  }

  return (
    <section className={styles.grid}>
      {blogs.map((blog) => {
        const coverImageUrl = getCoverImageUrl(blog);

        return (
          <article className={styles.card} key={blog.slug || blog._id}>
            <Link
              className={styles.cardLink}
              href={buildBlogHref(blog, backHref)}
              aria-label={`Read ${blog.title}`}
              onClick={() => trackResultClick({ blog, position: blogs.indexOf(blog) + 1, query, source })}
            />
            <div className={styles.cardContent}>
              <div className={styles.cardTop}>
                <div className={styles.meta}>
                  <span>{blog.category || "devhub"}</span>
                  <span>{formatRelativeDate(blog.createdAt)}</span>
                </div>
                <BookmarkButton blog={blog} className={styles.cardBookmark} contentType={blog.contentType} />
              </div>
              <h2><Highlight text={blog.title} query={query} /></h2>
              <p><Highlight text={blog.excerpt || blog.subheading} query={query} /></p>
              {blog.tags?.length ? (
                <div className={styles.tagList}>
                  {blog.tags.slice(0, 4).map((tag) => (
                    <span key={tag}>#{tag}</span>
                  ))}
                </div>
              ) : null}
              <div className={styles.stats}>
                <span>
                  <BookText size={14} />
                  {blog.readTime || 1} min
                </span>
                <span>
                  <Eye size={14} />
                  {blog.views || 0}
                </span>
                <span>
                  <Heart size={14} />
                  {blog.likesCount || 0}
                </span>
                <span>
                  <MessageCircle size={14} />
                  {blog.commentsCount || 0}
                </span>
              </div>
            </div>
            <div className={styles.cardCover}>
              {coverImageUrl ? (
                <Image src={coverImageUrl} alt="" fill sizes="(max-width: 760px) 108px, 180px" unoptimized />
              ) : (
                <Code2 size={22} />
              )}
            </div>
          </article>
        );
      })}
    </section>
  );
}

function getCoverImageUrl(blog) {
  if (typeof blog.coverImage === "string") {
    return blog.coverImage;
  }

  return blog.coverImage?.url || blog.coverImageUrl || blog.imageUrl || "";
}

function buildBlogHref(blog, backHref) {
  const basePath = blog.contentType === "project" ? "/projects" : "/blogs";
  const identifier = blog.contentType === "project" ? blog._id : blog.slug || blog._id;
  const href = `${basePath}/${identifier}`;

  if (!backHref) {
    return href;
  }

  return `${href}?from=${encodeURIComponent(backHref)}`;
}

function Highlight({ text = "", query = "" }) {
  const safeText = String(text || "");
  const terms = query.trim().split(/\s+/).filter((term) => term.length > 1).slice(0, 4);

  if (!terms.length) {
    return safeText;
  }

  const pattern = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "ig");

  return safeText.split(pattern).map((part, index) => (
    terms.some((term) => part.toLowerCase() === term.toLowerCase())
      ? <mark key={`${part}-${index}`}>{part}</mark>
      : part
  ));
}

function trackResultClick({ blog, position, query, source }) {
  if (!query || !source) {
    return;
  }

  searchApi.trackClick({
    blogId: blog._id,
    position,
    query,
    slug: blog.slug,
    source,
  }).catch(() => {});
}

function formatRelativeDate(value) {
  if (!value) {
    return "now";
  }

  const diffMs = Date.now() - new Date(value).getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  return `${Math.round(diffHours / 24)}d ago`;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
