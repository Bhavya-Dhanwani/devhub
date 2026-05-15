import Image from "next/image";
import Link from "next/link";
import { Bell, Bookmark, Code2, Link2, MessageCircle } from "lucide-react";
import { RightRail } from "./RightRail";
import styles from "../css/HomePage.module.css";

const imageTones = ["green", "blue", "amber", "red", "violet", "teal"];

function mapBlogToStory(blog, index) {
  return {
    author: blog.author?.name || "DevHub writer",
    comments: blog.commentsCount || 0,
    coverImage: blog.coverImage?.url || "",
    excerpt: blog.excerpt || blog.subheading,
    imageTone: imageTones[index % imageTones.length],
    network: blog.category || "devhub.app",
    read: `${blog.readTime || 1} min read`,
    slug: blog.slug,
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

export function LoggedInHome({ blogs = [], user }) {
  const posts = blogs.map(mapBlogToStory);

  return (
    <section className={styles.loggedInContent}>
      <div className={styles.activityColumn}>
        <div className={styles.promptRow}>
          <span className={styles.promptAvatar}>
            {(user?.name || "D").slice(0, 1).toUpperCase()}
          </span>
          <strong>What are you working on?</strong>
          <Link href="/write" aria-label="Start writing">
            <Link2 size={18} />
          </Link>
        </div>

        {posts.length ? posts.map((post) => (
          <StoryCard post={post} key={post.title} />
        )) : (
          <p className={styles.emptyFeed}>No published blogs yet. Start writing and your feed will wake up.</p>
        )}
      </div>

      <RightRail blogs={blogs} />
    </section>
  );
}

function StoryCard({ post }) {
  return (
    <article className={styles.storyCard}>
      <div className={styles.storyVotes}>
        <span>
          <Bell size={15} />
          {post.votes}
        </span>
        <span>
          <MessageCircle size={15} />
          {post.comments}
        </span>
      </div>
      <div className={styles.storyBody}>
        <p>
          <strong>{post.author}</strong>
          <span> in </span>
          <em>{post.network}</em>
        </p>
        <h2>{post.title}</h2>
        <p>
          <strong>{post.time} · {post.read}</strong> · {post.excerpt}
        </p>
        <Link href={post.slug ? `/blogs/${post.slug}` : "/dashboard"}>
          <MessageCircle size={15} />
          Join discussion
        </Link>
      </div>
      <div className={`${styles.storyImage} ${styles[post.imageTone]}`}>
        {post.coverImage ? (
          <Image src={post.coverImage} alt="" width={176} height={90} unoptimized />
        ) : (
          <Code2 size={22} />
        )}
      </div>
      <Bookmark className={styles.saveIcon} size={18} />
    </article>
  );
}
