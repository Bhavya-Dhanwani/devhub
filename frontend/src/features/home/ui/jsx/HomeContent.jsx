import { LoggedInHome } from "./LoggedInHome";
import { LoggedOutHome } from "./LoggedOutHome";
import { PopularPosts } from "./PopularPosts";
import styles from "../css/HomePage.module.css";

export function HomeContent({ blogs, isLoggedIn, user }) {
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
          <span>{recentBlogs.length} articles</span>
          <span>{writerCount} writers</span>
        </div>
      </header>

      {!isLoggedIn ? <LoggedOutHome /> : null}
      <PopularPosts blogs={blogs} isLoggedIn={isLoggedIn} />
      {isLoggedIn ? <LoggedInHome blogs={blogs} user={user} /> : null}
    </section>
  );
}
