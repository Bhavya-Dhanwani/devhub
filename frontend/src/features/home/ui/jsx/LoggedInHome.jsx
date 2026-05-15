import Image from "next/image";
import Link from "next/link";
import { Bell, Code2, MessageCircle } from "lucide-react";
import { BookmarkButton } from "@/features/blogs/ui/jsx/BookmarkButton";
import { RightRail } from "./RightRail";
import styles from "../css/HomePage.module.css";

const imageTones = ["green", "blue", "amber", "red", "violet", "teal"];

function mapBlogToStory(blog, index) {
  const isProject = blog.contentType === "project";
  const routeBase = blog.contentType === "project" ? "/projects" : "/blogs";
  const routeId = isProject ? blog._id : blog.slug || blog._id;

  return {
    author: blog.author?.name || "DevHub writer",
    authorId: blog.author?._id,
    comments: blog.commentsCount || 0,
    coverImage: blog.coverImage?.url || "",
    excerpt: blog.excerpt || blog.subheading,
    imageTone: imageTones[index % imageTones.length],
    isBookmarked: blog.isBookmarked,
    contentType: blog.contentType === "project" ? "project" : "blog",
    _id: blog._id,
    network: blog.category || "devhub.app",
    read: `${blog.readTime || 1} min read`,
    id: blog._id,
    href: routeId ? `${routeBase}/${routeId}?from=${encodeURIComponent("/")}` : routeBase,
    label: blog.contentType === "project" ? "Project" : "Blog",
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

export function LoggedInHome({ blogs = [] }) {
  const posts = blogs.map(mapBlogToStory);

  return (
    <section className={styles.loggedInContent}>
      <div className={styles.activityColumn}>
        {posts.length ? posts.map((post) => (
          <StoryCard post={post} key={post.id || post.title} />
        )) : (
          <p className={styles.emptyFeed}>No published blogs yet. Start writing and your feed will wake up.</p>
        )}
        <div className={styles.showMoreActions}>
          <Link className={styles.showMoreLink} href="/blogs">
            See more blogs
          </Link>
          <Link className={styles.showMoreLink} href="/projects">
            See more projects
          </Link>
        </div>
      </div>

      <RightRail blogs={blogs} />
    </section>
  );
}

function StoryCard({ post }) {
  return (
    <article className={styles.storyCard}>
      <Link className={styles.storyCardLink} href={post.href} aria-label={`Read ${post.title}`} />
      <div className={styles.storyVotes}>
        <span>
          <Bell size={15} />
          {post.votes}
        </span>
        <span>
          <MessageCircle size={15} />
          {post.comments}
        </span>
        <BookmarkButton blog={post} className={styles.storySaveButton} contentType={post.contentType} />
      </div>
      <div className={styles.storyBody}>
        <p>
          {post.authorId ? (
            <Link className={styles.authorLink} href={`/users/${post.authorId}`}>
              {post.author}
            </Link>
          ) : (
            <strong>{post.author}</strong>
          )}
          <span> in </span>
          <em>{post.network}</em>
          <span> · {post.label}</span>
        </p>
        <h2>{post.title}</h2>
        <p>
          <strong>{post.time} · {post.read}</strong> · {post.excerpt}
        </p>
        <Link href={post.href}>
          <MessageCircle size={15} />
          Join discussion
        </Link>
      </div>
      <div className={`${styles.storyImage} ${styles[post.imageTone]}`}>
        {post.coverImage ? (
          <Image src={post.coverImage} alt="" fill sizes="176px" unoptimized />
        ) : (
          <Code2 size={22} />
        )}
      </div>
    </article>
  );
}
