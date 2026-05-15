import Link from "next/link";
import Image from "next/image";
import { Bell, Code2, MessageCircle } from "lucide-react";
import styles from "../css/HomePage.module.css";

function mapBlogToPost(blog) {
  const isProject = blog.contentType === "project";
  const routeBase = blog.contentType === "project" ? "/projects" : "/blogs";
  const routeId = isProject ? blog._id : blog.slug || blog._id;

  return {
    author: blog.author?.name || "DevHub writer",
    authorId: blog.author?._id,
    comments: blog.commentsCount || 0,
    coverImage: blog.coverImage?.url || "",
    href: routeId ? `${routeBase}/${routeId}?from=${encodeURIComponent("/")}` : routeBase,
    id: blog._id,
    label: blog.contentType === "project" ? "Project" : "Blog",
    read: `${blog.readTime || 1} min`,
    time: formatRelativeDate(blog.createdAt),
    title: blog.title,
    votes: blog.likesCount || blog.views || 0,
  };
}

function formatRelativeDate(value) {
  if (!value) {
    return "now";
  }

  const createdAt = new Date(value).getTime();
  const diffHours = Math.max(1, Math.round((Date.now() - createdAt) / 36e5));

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  return `${Math.round(diffHours / 24)}d ago`;
}

export function PopularPosts({
  blogs = [],
  emptyText = "No published blogs yet.",
  isLoggedIn,
  title = "New & Popular",
}) {
  const posts = blogs.map(mapBlogToPost);

  return (
    <section className={isLoggedIn ? styles.loggedInFeedSection : styles.feedSection} id="feed">
      <div className={styles.feedHeader}>
        <span />
        <strong>{title}</strong>
        <hr />
      </div>

      <div className={styles.postGrid}>
        {posts.length ? posts.map((post) => (
          <article className={styles.postCard} key={post.id || post.title}>
            <Link className={styles.postCardLink} href={post.href} aria-label={`Read ${post.title}`} />
            <div className={styles.thumbnail}>
              {post.coverImage ? (
                <Image src={post.coverImage} alt="" fill sizes="128px" unoptimized />
              ) : (
                <Code2 size={20} />
              )}
            </div>
            <div className={styles.postContent}>
              <p>
                <em className={styles.postType}>{post.label}</em>
                {post.authorId ? (
                  <Link className={styles.postAuthorLink} href={`/users/${post.authorId}`}>
                    {post.author}
                  </Link>
                ) : (
                  <strong>{post.author}</strong>
                )}
                <span> · {post.time} · {post.read}</span>
              </p>
              <h2>{post.title}</h2>
              <div className={styles.postStats}>
                <span>
                  <Bell size={15} />
                  {post.votes}
                </span>
                <span>
                  <MessageCircle size={15} />
                  {post.comments}
                </span>
              </div>
            </div>
          </article>
        )) : (
          <p className={styles.emptyFeed}>{emptyText}</p>
        )}
      </div>
    </section>
  );
}
