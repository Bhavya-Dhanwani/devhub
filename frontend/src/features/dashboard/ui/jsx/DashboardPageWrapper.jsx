"use client";

import { AuthGuard } from "@/features/auth/ui/jsx/AuthGuard";
import { AppSidebar } from "@/shared/components/layout/AppSidebar";
import { useDashboardPage } from "../../hooks/useDashboardPage";
import { DashboardBlogGrid } from "./DashboardBlogGrid";
import { DashboardProfileHeader } from "./DashboardProfileHeader";
import { DashboardTabs } from "./DashboardTabs";
import styles from "../css/DashboardPageWrapper.module.css";

export function DashboardPageWrapper() {
  const {
    activeTab,
    blogsError,
    filteredBlogs,
    isBlogsLoading,
    stats,
    tabs,
    user,
    username,
    onDeleteBlog,
    onToggleBlogStatus,
    setActiveTab,
  } = useDashboardPage();

  return (
    <AuthGuard>
      <main className={styles.shell}>
        <AppSidebar collapsed />

        <section className={styles.content}>
          <DashboardProfileHeader stats={stats} user={user} username={username} />
          <DashboardTabs activeTab={activeTab} tabs={tabs} onTabChange={setActiveTab} />
          <DashboardBlogGrid
            error={blogsError}
            isLoading={isBlogsLoading}
            items={filteredBlogs}
            onDelete={onDeleteBlog}
            onToggleStatus={onToggleBlogStatus}
          />
        </section>
      </main>
    </AuthGuard>
  );
}
