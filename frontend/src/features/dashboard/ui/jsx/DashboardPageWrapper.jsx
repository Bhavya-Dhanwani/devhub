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
    isEditProfileOpen,
    isLoggingOut,
    isUpdatingProfile,
    stats,
    tabs,
    user,
    username,
    onConvertContentType,
    onDeleteBlog,
    onUpdateProfile,
    onLogout,
    onToggleBlogStatus,
    setActiveTab,
    setIsEditProfileOpen,
  } = useDashboardPage();

  return (
    <AuthGuard>
      <main className={styles.shell}>
        <AppSidebar collapsed />

        <section className={styles.content}>
          <DashboardProfileHeader
            isLoggingOut={isLoggingOut}
            stats={stats}
            user={user}
            username={username}
            isEditProfileOpen={isEditProfileOpen}
            onLogout={onLogout}
            isUpdatingProfile={isUpdatingProfile}
            onEditProfile={setIsEditProfileOpen}
            onUpdateProfile={onUpdateProfile}
          />
          <DashboardTabs activeTab={activeTab} tabs={tabs} onTabChange={setActiveTab} />
          <DashboardBlogGrid
            error={blogsError}
            isLoading={isBlogsLoading}
            items={filteredBlogs}
            onConvertType={onConvertContentType}
            onDelete={onDeleteBlog}
            onToggleStatus={onToggleBlogStatus}
          />
        </section>
      </main>
    </AuthGuard>
  );
}
