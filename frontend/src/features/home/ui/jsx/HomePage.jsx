"use client";

import { useAppSelector } from "@/core/store/hooks";
import { usePublicBlogs } from "@/features/blogs/hooks/usePublicBlogs";
import { selectAuth } from "@/features/auth/state/authSlice";
import { AppSidebar } from "@/shared/components/layout/AppSidebar";
import styles from "../css/HomePage.module.css";
import { HomeContent } from "./HomeContent";

export function HomePage() {
  const { status, user } = useAppSelector(selectAuth);
  const { blogs } = usePublicBlogs({ limit: 30, sort: "latest" });
  const { blogs: projects } = usePublicBlogs({ contentType: "project", limit: 30, sort: "latest" });
  const mixedContent = [...blogs, ...projects]
    .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime());
  const isLoggedIn = status === "authenticated";

  return (
    <main className={styles.shell}>
      <AppSidebar />
      <HomeContent blogs={mixedContent} isLoggedIn={isLoggedIn} user={user} />
    </main>
  );
}
