"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@/core/store/hooks";
import { getApiErrorMessage } from "@/core/api/apiClient";
import { blogsApi, projectsApi } from "@/features/blogs/api/blogs.api";
import { useUserBlogs } from "@/features/blogs/hooks/useUserBlogs";
import { logoutUser, selectAuth, updateCurrentUser } from "@/features/auth/state/authSlice";
import { usersApi } from "@/features/users/api/users.api";
import { dashboardHighlights, dashboardTabs } from "../data/dashboard.data";

export function useDashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(selectAuth);
  const [activeTab, setActiveTab] = useState("all");
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const {
    blogs,
    error: blogsError,
    isLoading: isBlogsLoading,
    reload: reloadBlogs,
    stats: blogStats,
  } = useUserBlogs({
    contentType: "all",
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
      contentType: blog.contentType === "project" ? "project" : "blog",
      editHref: blog.contentType === "project" ? `/projects/edit/${blog._id}` : `/write/edit/${blog._id}`,
      meta: `${blog.readTime || 1} min read · ${blog.views || 0} views`,
      previewHref: getDashboardBlogHref(blog),
      status: blog.status,
      title: blog.title,
      tone: ["green", "blue", "violet"][index % 3],
    }));
  }, [activeTab, blogs]);

  const stats = useMemo(() => {
    const publishedBlogCount = blogs.filter((blog) => blog.status === "published" && blog.contentType !== "project").length;
    const publishedProjectCount = blogs.filter((blog) => blog.status === "published" && blog.contentType === "project").length;
    const draftCount = blogs.filter((blog) => blog.status === "draft").length;

    return {
      posts: blogStats?.posts ?? blogs.length,
      blogs: blogStats?.blogs ?? publishedBlogCount,
      drafts: blogStats?.drafts ?? draftCount,
      followersCount: user?.followersCount || 0,
      followingCount: user?.followingCount || 0,
      projects: blogStats?.projects ?? publishedProjectCount,
      totalComments: blogStats?.totalComments ?? sumBy(blogs, "commentsCount"),
      totalLikes: blogStats?.totalLikes ?? sumBy(blogs, "likesCount"),
      totalViews: blogStats?.totalViews ?? sumBy(blogs, "views"),
    };
  }, [blogStats, blogs, user?.followersCount, user?.followingCount]);

  const username = useMemo(
    () => (user?.username || user?.email?.split("@")[0] || "devhub_user").replace(/\s+/g, "_"),
    [user?.email, user?.username],
  );

  const onLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    const action = await dispatch(logoutUser());

    if (logoutUser.rejected.match(action)) {
      toast.info("Signed out locally. Please sign in again.");
    } else {
      toast.success("Logged out successfully.");
    }

    router.replace("/login");
  };

  const onToggleBlogStatus = async (item) => {
    const nextStatus = item.status === "published" ? "draft" : "published";
    const contentApi = getContentApi(item.contentType);

    try {
      await contentApi.updateStatus(item.id, nextStatus);
      toast.success(nextStatus === "published" ? "Published." : "Moved to drafts.");
      await reloadBlogs();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const onUpdateProfile = async (values) => {
    if (isUpdatingProfile) {
      return;
    }

    setIsUpdatingProfile(true);

    try {
      const updatedUser = await usersApi.updateMe(values);
      dispatch(updateCurrentUser(updatedUser));
      toast.success("Profile updated.");
      setIsEditProfileOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onDeleteBlog = async (item) => {
    const shouldDelete = window.confirm(`Delete "${item.title}"? This cannot be undone.`);
    const contentApi = getContentApi(item.contentType);

    if (!shouldDelete) {
      return;
    }

    try {
      await contentApi.delete(item.id);
      toast.success("Deleted.");
      await reloadBlogs();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const onConvertContentType = async (item) => {
    const nextContentType = item.contentType === "project" ? "blog" : "project";
    const contentApi = getContentApi(item.contentType);

    try {
      await contentApi.updateContentType(item.id, nextContentType);
      toast.success(nextContentType === "project" ? "Converted to project." : "Converted to blog.");
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
    isEditProfileOpen,
    isLoggingOut,
    isUpdatingProfile,
    stats,
    tabs: dashboardTabs,
    user,
    username,
    onConvertContentType,
    onDeleteBlog,
    onLogout,
    onToggleBlogStatus,
    onUpdateProfile,
    setActiveTab,
    setIsEditProfileOpen,
  };
}

function getContentApi(contentType = "blog") {
  return contentType === "project" ? projectsApi : blogsApi;
}

function sumBy(items, key) {
  return items.reduce((total, item) => total + (Number(item[key]) || 0), 0);
}

function getDashboardBlogHref(blog) {
  const isProject = blog.contentType === "project";
  const routeBase = blog.contentType === "project" ? "/projects" : "/blogs";
  const routeId = isProject ? blog._id : blog.slug || blog._id;

  if (blog.status === "published") {
    return `${routeBase}/${routeId}?from=${encodeURIComponent("/dashboard")}`;
  }

  if (blog.contentType === "project") {
    return `/projects/preview/${blog._id}?from=${encodeURIComponent("/dashboard")}`;
  }

  return `/write/preview/${blog._id}?from=${encodeURIComponent("/dashboard")}`;
}
