"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { UserPlus, UserRoundCheck } from "lucide-react";
import { AppSidebar } from "@/shared/components/layout/AppSidebar";
import { getApiErrorMessage } from "@/core/api/apiClient";
import { useAppSelector } from "@/core/store/hooks";
import { selectAuth } from "@/features/auth/state/authSlice";
import { blogsApi, projectsApi } from "@/features/blogs/api/blogs.api";
import { BlogResultGrid } from "@/features/blogs/ui/jsx/BlogResultGrid";
import { DashboardProfileHeader } from "@/features/dashboard/ui/jsx/DashboardProfileHeader";
import { usersApi } from "../../api/users.api";
import styles from "@/features/dashboard/ui/css/DashboardPageWrapper.module.css";

export function PublicUserProfilePage({ userId }) {
  const router = useRouter();
  const { status, user: authUser } = useAppSelector(selectAuth);
  const [blogs, setBlogs] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [profileStats, setProfileStats] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [followState, setFollowState] = useState({
    followersCount: 0,
    followingCount: 0,
    isFollowing: false,
  });
  const [isFollowSaving, setIsFollowSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadUserBlogs() {
      setIsLoading(true);
      setError("");

      try {
        const requestParams = {
          limit: 50,
          sort: "latest",
          status: "published",
        };
        const [blogPayload, projectPayload] = await Promise.all([
          blogsApi.getByUser(userId, requestParams),
          projectsApi.getByUser(userId, requestParams),
        ]);
        const content = mergeContent(blogPayload.blogs, projectPayload.blogs);
        const stats = mergeStats(blogPayload.stats, projectPayload.stats);
        const publicUser = blogPayload.user || projectPayload.user || content[0]?.author || null;

        if (isMounted) {
          setBlogs(content);
          setProfileStats(stats);
          setProfileUser(publicUser);
          setFollowState((current) => ({
            ...current,
            followersCount: stats.followersCount || 0,
            followingCount: stats.followingCount || 0,
          }));
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message || "Unable to load this profile.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    if (userId) {
      loadUserBlogs();
    }

    return () => {
      isMounted = false;
    };
  }, [userId]);

  useEffect(() => {
    let isMounted = true;

    async function loadFollowStatus() {
      if (!userId) {
        return;
      }

      try {
        const payload = await usersApi.getFollowStatus(userId);

        if (isMounted) {
          setFollowState(payload);
        }
      } catch {
        // The public profile should still render if follow metadata is unavailable.
      }
    }

    loadFollowStatus();

    return () => {
      isMounted = false;
    };
  }, [status, userId]);

  const user = profileUser || blogs[0]?.author || null;
  const stats = useMemo(() => ({
    posts: profileStats?.posts ?? blogs.length,
    blogs: profileStats?.blogs ?? blogs.filter((blog) => blog.contentType !== "project").length,
    drafts: 0,
    followersCount: followState.followersCount,
    followingCount: followState.followingCount,
    projects: profileStats?.projects ?? blogs.filter((blog) => blog.contentType === "project").length,
    totalComments: profileStats?.totalComments ?? sumBy(blogs, "commentsCount"),
    totalLikes: profileStats?.totalLikes ?? sumBy(blogs, "likesCount"),
    totalViews: profileStats?.totalViews ?? sumBy(blogs, "views"),
  }), [blogs, followState.followersCount, followState.followingCount, profileStats]);
  const username = user?.username || user?.name || "DevHub writer";
  const isOwnProfile = authUser?.id && user?._id && String(authUser.id) === String(user._id);

  const onToggleFollow = async () => {
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }

    if (isOwnProfile || isFollowSaving) {
      return;
    }

    setIsFollowSaving(true);

    try {
      const payload = followState.isFollowing
        ? await usersApi.unfollow(userId)
        : await usersApi.follow(userId);

      setFollowState(payload);
      toast.success(payload.isFollowing ? "Following writer." : "Unfollowed writer.");
    } catch (followError) {
      toast.error(getApiErrorMessage(followError));
    } finally {
      setIsFollowSaving(false);
    }
  };

  return (
    <main className={styles.shell}>
      <AppSidebar collapsed />
      <section className={styles.content}>
        <DashboardProfileHeader
          showActions={false}
          showDrafts={false}
          stats={stats}
          user={user}
          username={username}
          profileAction={!isOwnProfile ? (
            <button
              className={followState.isFollowing ? styles.followingButton : styles.followButton}
              disabled={isFollowSaving}
              type="button"
              onClick={onToggleFollow}
            >
              {followState.isFollowing ? <UserRoundCheck size={16} /> : <UserPlus size={16} />}
              {isFollowSaving ? "Saving..." : followState.isFollowing ? "Following" : "Follow"}
            </button>
          ) : null}
        />

        <BlogResultGrid
          blogs={blogs}
          emptyText={error ? "" : "This writer has not published any blogs or projects yet."}
          error={error}
          isLoading={isLoading}
          loadingText="Loading profile..."
        />
      </section>
    </main>
  );
}

function sumBy(items, key) {
  return items.reduce((total, item) => total + (Number(item[key]) || 0), 0);
}

function mergeContent(blogs = [], projects = []) {
  const contentById = new Map();

  for (const item of [...blogs, ...projects]) {
    if (!item?._id) {
      continue;
    }

    contentById.set(String(item._id), {
      ...item,
      contentType: item.contentType === "project" ? "project" : "blog",
    });
  }

  return [...contentById.values()]
    .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime());
}

function mergeStats(blogStats = {}, projectStats = {}) {
  return {
    blogs: blogStats.blogs || 0,
    followersCount: blogStats.followersCount || projectStats.followersCount || 0,
    followingCount: blogStats.followingCount || projectStats.followingCount || 0,
    posts: (blogStats.posts || 0) + (projectStats.posts || 0),
    projects: projectStats.projects || 0,
    totalComments: (blogStats.totalComments || 0) + (projectStats.totalComments || 0),
    totalLikes: (blogStats.totalLikes || 0) + (projectStats.totalLikes || 0),
    totalViews: (blogStats.totalViews || 0) + (projectStats.totalViews || 0),
  };
}
