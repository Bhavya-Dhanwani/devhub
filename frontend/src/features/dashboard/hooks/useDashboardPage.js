"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@/core/store/hooks";
import { getApiErrorMessage } from "@/core/api/apiClient";
import { blogsApi } from "@/features/blogs/api/blogs.api";
import { useUserBlogs } from "@/features/blogs/hooks/useUserBlogs";
import { logoutUser, selectAuth } from "@/features/auth/state/authSlice";
import { dashboardHighlights, dashboardTabs } from "../data/dashboard.data";

export function useDashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(selectAuth);
  const [activeTab, setActiveTab] = useState("all");
  const {
    blogs,
    error: blogsError,
    isLoading: isBlogsLoading,
    reload: reloadBlogs,
  } = useUserBlogs({
    limit: 30,
    sort: "latest",
    status: "all",
  });

  const filteredBlogs = useMemo(() => {
    const visibleBlogs = activeTab === "all"
      ? blogs
      : blogs.filter((blog) => blog.status === activeTab);

    return visibleBlogs.map((blog, index) => ({
      id: blog._id,
      editHref: `/write/edit/${blog._id}`,
      meta: `${blog.readTime || 1} min read · ${blog.views || 0} views`,
      previewHref: `/write/preview/${blog._id}`,
      status: blog.status,
      title: blog.title,
      tone: ["green", "blue", "violet"][index % 3],
    }));
  }, [activeTab, blogs]);

  const stats = useMemo(() => {
    const publishedCount = blogs.filter((blog) => blog.status === "published").length;
    const draftCount = blogs.filter((blog) => blog.status === "draft").length;

    return {
      posts: blogs.length,
      blogs: publishedCount,
      drafts: draftCount,
      followers: 251,
      following: 192,
    };
  }, [blogs]);

  const username = useMemo(
    () => (user?.email?.split("@")[0] || "devhub_user").replace(/\s+/g, "_"),
    [user?.email],
  );

  const onLogout = async () => {
    await dispatch(logoutUser());
    router.replace("/login");
  };

  const onToggleBlogStatus = async (item) => {
    const nextStatus = item.status === "published" ? "draft" : "published";

    try {
      await blogsApi.updateStatus(item.id, nextStatus);
      toast.success(nextStatus === "published" ? "Blog published." : "Moved to drafts.");
      await reloadBlogs();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const onDeleteBlog = async (item) => {
    const shouldDelete = window.confirm(`Delete "${item.title}"? This cannot be undone.`);

    if (!shouldDelete) {
      return;
    }

    try {
      await blogsApi.delete(item.id);
      toast.success("Blog deleted.");
      await reloadBlogs();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return {
    activeTab,
    blogsError,
    filteredBlogs,
    highlights: dashboardHighlights,
    isBlogsLoading,
    stats,
    tabs: dashboardTabs,
    user,
    username,
    onDeleteBlog,
    onLogout,
    onToggleBlogStatus,
    setActiveTab,
  };
}
