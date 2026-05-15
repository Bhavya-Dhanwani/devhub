import Link from "next/link";
import Image from "next/image";
import { Bell, Code2, MessageCircle } from "lucide-react";
import styles from "../css/HomePage.module.css";

const tones = ["blue", "teal", "amber", "violet", "green", "red"];

function mapBlogToPost(blog, index) {
  return {
    author: blog.author?.name || "DevHub writer",
    comments: blog.commentsCount || 0,
    coverImage: blog.coverImage?.url || "",
    read: `${blog.readTime || 1} min`,
    slug: blog.slug,
    time: formatRelativeDate(blog.createdAt),
    title: blog.title,
    tone: tones[index % tones.length],
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

export function PopularPosts({ blogs = [], isLoggedIn }) {
  const posts = [...blogs]
    .sort((first, second) => (second.views || 0) - (first.views || 0))
    .slice(0, 6)
    .map(mapBlogToPost);

  return (
    <section className={isLoggedIn ? styles.loggedInFeedSection : styles.feedSection} id="feed">
      <div className={styles.feedHeader}>
        <span />
        <strong>New & Popular</strong>
        <hr />
      </div>

      <div className={styles.postGrid}>
        {posts.length ? posts.map((post) => (
          <Link className={styles.postCard} href={`/blogs/${post.slug}`} key={post.title}>
            <div className={`${styles.thumbnail} ${styles[post.tone]}`}>
              {post.coverImage ? (
                <Image src={post.coverImage} alt="" width={128} height={66} unoptimized />
              ) : (
                <Code2 size={20} />
              )}
            </div>
            <div className={styles.postContent}>
              <p>
                <strong>{post.author}</strong>
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
          </Link>
        )) : (
          <p className={styles.emptyFeed}>No published blogs yet.</p>
        )}
      </div>
    </section>
  );
}
