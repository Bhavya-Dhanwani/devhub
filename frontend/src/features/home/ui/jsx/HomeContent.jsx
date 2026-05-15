import { LoggedInHome } from "./LoggedInHome";
import { LoggedOutHome } from "./LoggedOutHome";
import { PopularPosts } from "./PopularPosts";
import styles from "../css/HomePage.module.css";

export function HomeContent({ blogs, isLoggedIn, user }) {
  const blogCount = blogs.filter((blog) => blog.contentType !== "project").length;
  const projectCount = blogs.filter((blog) => blog.contentType === "project").length;
  const latestBlogs = [...blogs]
    .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime())
    .slice(0, 4);
  const trendingBlogs = [...blogs]
    .sort((first, second) => getTrendingScore(second) - getTrendingScore(first))
    .slice(0, 4);
  const normalBlogs = buildPersonalizedFeed(blogs);
  const recentBlogs = blogs.filter((blog) => {
    const createdAt = new Date(blog.createdAt).getTime();
    return Number.isFinite(createdAt) && Date.now() - createdAt <= 24 * 60 * 60 * 1000;
  });
  const writerCount = new Set(blogs.map((blog) => blog.author?._id || blog.author?.name).filter(Boolean)).size;

  return (
    <section className={styles.main}>
      <header className={styles.topbar}>
        <strong>Popular posts</strong>
        <div>
          <span>Last 24h:</span>
          <em />
          <span>{recentBlogs.length} updates</span>
          <span>{writerCount} writers</span>
          <span>{blogCount} blogs</span>
          <span>{projectCount} projects</span>
        </div>
      </header>

      {!isLoggedIn ? <LoggedOutHome /> : null}
      <PopularPosts
        blogs={latestBlogs}
        emptyText="No latest blogs or projects yet."
        isLoggedIn={isLoggedIn}
        title="New & Popular"
      />
      <PopularPosts
        blogs={trendingBlogs}
        emptyText="No trending blogs or projects yet."
        isLoggedIn={isLoggedIn}
        title="Trending Now"
      />
      <LoggedInHome blogs={normalBlogs} user={user} />
    </section>
  );
}

function getTrendingScore(blog) {
  return (blog.views || 0) + ((blog.likesCount || 0) * 5) + ((blog.commentsCount || 0) * 3);
}

function buildPersonalizedFeed(blogs) {
  const followedBlogs = blogs.filter((blog) => blog.isAuthorFollowed).slice(0, 13);
  const discoveryBlogs = blogs.filter((blog) => !blog.isAuthorFollowed).slice(0, 20 - followedBlogs.length);

  return [...followedBlogs, ...discoveryBlogs];
}
