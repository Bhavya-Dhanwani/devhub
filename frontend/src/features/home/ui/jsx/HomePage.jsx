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
  const isLoggedIn = status === "authenticated";

  return (
    <main className={styles.shell}>
      <AppSidebar />
      <HomeContent blogs={blogs} isLoggedIn={isLoggedIn} user={user} />
    </main>
  );
}
