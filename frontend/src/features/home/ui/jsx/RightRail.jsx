import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import styles from "../css/HomePage.module.css";

export function RightRail({ blogs = [] }) {
  const recentActivity = blogs
    .filter((blog) => (blog.commentsCount || 0) > 0)
    .slice(0, 3);
  const activeWriters = getActiveWriters(blogs);
  const weeklyTags = getTagRanks(blogs);
  const topSeries = getCategoryRanks(blogs);

  return (
    <aside className={styles.commentsPanel}>
      <div className={styles.commentsTitle}>
        <MessageCircle size={20} />
        <h2>Recent comments</h2>
      </div>
      {recentActivity.length ? recentActivity.map((item) => (
        <article className={styles.commentItem} key={item._id}>
          <strong>{item.title}</strong>
          <p>{item.commentsCount} comments on this {item.contentType === "project" ? "project" : "post"}</p>
          <span>{item.author?.name || "DevHub writer"} · {formatRelativeDate(item.createdAt)}</span>
        </article>
      )) : (
        <article className={styles.commentItem}>
          <strong>No comments yet</strong>
          <p>Published blogs and projects will show discussion activity here.</p>
          <span>Live data</span>
        </article>
      )}

      <section className={styles.sideSection}>
        <h2>Active writers</h2>
        {activeWriters.map(([initials, name, text, badge, avatar, authorId]) => {
          const content = (
            <>
              <span>
                {avatar ? (
                  <Image src={avatar} alt="" width={38} height={38} unoptimized />
                ) : (
                  initials
                )}
              </span>
              <div>
                <strong>{name}</strong>
                <p>{text}</p>
                <em>{badge}</em>
              </div>
            </>
          );

          return authorId ? (
            <Link className={styles.writerItem} href={`/users/${authorId}`} key={authorId}>
              {content}
            </Link>
          ) : (
            <article className={styles.writerItem} key={name}>
              {content}
            </article>
          );
        })}
      </section>

      <section className={styles.sideSection}>
        <h2>Trending tags this week</h2>
        {weeklyTags.map(([tag, count], index) => (
          <div className={styles.tagRank} key={tag}>
            <span>{index + 1}</span>
            <strong>#{tag}</strong>
            <em>{count}</em>
          </div>
        ))}
      </section>

      <section className={styles.sideSection}>
        <h2>Top series</h2>
        {topSeries.map(([title, source, views, count], index) => (
          <div className={styles.seriesRank} key={title}>
            <span>{index + 1}</span>
            <div>
              <strong>{title}</strong>
              <p>{source}</p>
            </div>
            <em>
              {views}
              <br />
              {count}
            </em>
          </div>
        ))}
      </section>
    </aside>
  );
}

function getActiveWriters(blogs) {
  const writers = new Map();

  for (const blog of blogs) {
    const name = blog.author?.name || "DevHub writer";
    const authorId = blog.author?._id || "";
    const writerKey = authorId || name;
    const current = writers.get(writerKey) || { avatar: blog.author?.avatar || "", id: authorId, name, posts: 0, views: 0 };
    writers.set(writerKey, {
      avatar: current.avatar || blog.author?.avatar || "",
      id: current.id || authorId,
      name,
      posts: current.posts + 1,
      views: current.views + (blog.views || 0),
    });
  }

  return [...writers.entries()]
    .sort(([, first], [, second]) => second.posts - first.posts || second.views - first.views)
    .slice(0, 3)
    .map(([, stats]) => [
      getInitials(stats.name),
      stats.name,
      `${stats.views} total views`,
      `${stats.posts} ${stats.posts === 1 ? "item" : "items"}`,
      stats.avatar,
      stats.id,
    ]);
}

function getTagRanks(blogs) {
  const tags = new Map();

  for (const blog of blogs) {
    for (const tag of blog.tags || []) {
      tags.set(tag, (tags.get(tag) || 0) + 1);
    }
  }

  return [...tags.entries()]
    .sort(([, first], [, second]) => second - first)
    .slice(0, 10);
}

function getCategoryRanks(blogs) {
  const categories = new Map();

  for (const blog of blogs) {
    const category = blog.category || "tech";
    const current = categories.get(category) || { posts: 0, views: 0 };
    categories.set(category, {
      posts: current.posts + 1,
      views: current.views + (blog.views || 0),
    });
  }

  return [...categories.entries()]
    .sort(([, first], [, second]) => second.posts - first.posts || second.views - first.views)
    .slice(0, 10)
    .map(([category, stats]) => [
      category,
      "Published content",
      `${stats.views} views`,
      `${stats.posts} ${stats.posts === 1 ? "item" : "items"}`,
    ]);
}

function getInitials(name) {
  return String(name || "DW")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "DW";
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
