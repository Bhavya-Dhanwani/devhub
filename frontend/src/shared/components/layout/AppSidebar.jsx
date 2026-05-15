"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Code2,
  FileText,
  Folder,
  Home,
  Link2,
  Menu,
  Search,
} from "lucide-react";
import logo from "@/assets/images/logo.png";
import { useAppSelector } from "@/core/store/hooks";
import { selectAuth } from "@/features/auth/state/authSlice";
import { BrandWordmark } from "@/shared/components/common/BrandWordmark";
import styles from "./AppSidebar.module.css";

const mainItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/blogs", icon: Folder, label: "Blogs" },
  { href: "/projects", icon: Code2, label: "Projects" },
  { href: "/bookmarks", icon: Bookmark, label: "Bookmarks" },
  { href: "/search", icon: Search, label: "Search", shortcut: "Ctrl K" },
];

const authorItems = [
  { href: "/write/new", icon: Link2, label: "Write" },
  { href: "/dashboard", icon: FileText, label: "Dashboard" },
];

const sidebarPreferenceKey = "devhub.sidebarCollapsed";
const mobileSidebarQuery = "(max-width: 760px)";

export function AppSidebar({ collapsed = false }) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const pathname = usePathname();
  const router = useRouter();
  const { status, user } = useAppSelector(selectAuth);
  const isLoggedIn = status === "authenticated";

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        router.push("/search");
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [router]);

  useEffect(() => {
    const mobileQuery = window.matchMedia(mobileSidebarQuery);

    const syncSidebarMode = () => {
      setIsCollapsed(mobileQuery.matches ? true : getStoredSidebarPreference(collapsed));
    };

    syncSidebarMode();
    mobileQuery.addEventListener("change", syncSidebarMode);
    window.addEventListener("storage", syncSidebarMode);

    return () => {
      mobileQuery.removeEventListener("change", syncSidebarMode);
      window.removeEventListener("storage", syncSidebarMode);
    };
  }, [collapsed]);

  const updateSidebar = (value) => {
    setIsCollapsed((current) => {
      const nextCollapsed = typeof value === "function" ? value(current) : value;
      const isMobile = window.matchMedia(mobileSidebarQuery).matches;

      if (!isMobile) {
        window.localStorage.setItem(sidebarPreferenceKey, String(nextCollapsed));
      }

      return nextCollapsed;
    });
  };

  return (
    <>
      <header className={styles.mobileBar}>
        <button type="button" aria-label="Open menu" onClick={() => updateSidebar(false)}>
          <Menu size={20} />
        </button>
        <Link className={styles.mobileBrand} href="/">
          <Image src={logo} alt="" priority sizes="24px" />
          <span className={styles.mobileBrandText}>
            <span className={styles.mobileBrandDev}>Dev</span>
            <span className={styles.mobileBrandHub}>Hub</span>
          </span>
        </Link>
        <div className={styles.mobileActions}>
          <Link href="/search" aria-label="Search">
            <Search size={19} />
          </Link>
          <Link2 size={18} />
          {isLoggedIn && user?.avatar ? (
            <Link className={styles.mobileUser} href="/dashboard" aria-label="Profile">
              <Image src={user.avatar} alt="" width={24} height={24} unoptimized />
            </Link>
          ) : null}
        </div>
      </header>

      {!isCollapsed ? (
        <button
          className={styles.mobileScrim}
          type="button"
          aria-label="Close menu"
          onClick={() => updateSidebar(true)}
        />
      ) : null}

      <aside className={isCollapsed ? styles.collapsedSidebar : styles.sidebar}>
        <div className={styles.top}>
          <Link className={isCollapsed ? styles.logoOnly : styles.brand} href="/" aria-label="DevHub home">
            <Image src={logo} alt="" priority sizes="28px" />
            {!isCollapsed ? <BrandWordmark className={styles.brandText} /> : null}
          </Link>

          <button
            className={styles.collapseButton}
            type="button"
            aria-label={isCollapsed ? "Open sidebar" : "Close sidebar"}
            onClick={() => updateSidebar((current) => !current)}
          >
            {isCollapsed ? <ChevronRight size={19} /> : <ChevronLeft size={19} />}
          </button>
        </div>

        <nav className={isCollapsed ? styles.iconNav : styles.nav} aria-label="Main navigation">
          {mainItems.map((item) => (
            <SidebarLink collapsed={isCollapsed} isActive={isActive(pathname, item.href, item.label)} item={item} key={item.label} />
          ))}
        </nav>

        <nav className={isCollapsed ? styles.iconAuthorNav : styles.authorBlock} aria-label="Author navigation">
          {!isCollapsed ? <p>Author</p> : null}
          {authorItems.map((item) => (
            <SidebarLink collapsed={isCollapsed} isActive={pathname === item.href} item={item} key={item.label} />
          ))}
        </nav>

      <div className={isCollapsed ? styles.collapsedFooter : styles.sidebarFooter}>
        {isLoggedIn ? (
          <>
            <Link className={isCollapsed ? styles.userDot : styles.userLink} href="/dashboard" title="Profile">
              <UserAvatar user={user} />
              {!isCollapsed ? (
                <>
                  <strong>{user?.name || "Developer"}</strong>
                  <span className={styles.desktopDot} />
                </>
              ) : null}
            </Link>
          </>
        ) : (
          <Link className={isCollapsed ? styles.userDot : styles.signInButton} href="/login" title="Sign in">
            {isCollapsed ? "B" : (
              <>
                <Link2 size={16} />
                Sign In
              </>
            )}
          </Link>
        )}

        {!isCollapsed ? (
          <>
            <div className={styles.footerLinks}>
              <Link href="/terms">Terms</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/">Sitemap</Link>
            </div>
            <p>© 2026 <BrandWordmark /> Inc.</p>
          </>
        ) : null}
      </div>
      </aside>
    </>
  );
}

function SidebarLink({ collapsed, isActive, item }) {
  const Icon = item.icon;

  return (
    <Link
      className={collapsed ? (isActive ? styles.activeIconItem : styles.iconItem) : (isActive ? styles.activeNavItem : styles.navItem)}
      href={item.href}
      title={item.label}
    >
      <Icon size={collapsed ? 18 : 17} />
      {!collapsed ? <span>{item.label}</span> : null}
      {!collapsed && item.shortcut ? <kbd>{item.shortcut}</kbd> : null}
    </Link>
  );
}

function UserAvatar({ user }) {
  if (user?.avatar) {
    return <Image src={user.avatar} alt="" width={22} height={22} unoptimized />;
  }

  return (user?.name || "B").slice(0, 1).toUpperCase();
}

function getStoredSidebarPreference(fallback) {
  const storedValue = window.localStorage.getItem(sidebarPreferenceKey);

  if (storedValue === "true") {
    return true;
  }

  if (storedValue === "false") {
    return false;
  }

  return fallback;
}

function isActive(pathname, href, label) {
  if (label === "Home") {
    return pathname === "/";
  }

  if (label === "Blogs") {
    return pathname === "/blogs" || pathname.startsWith("/blogs/");
  }

  if (label === "Projects") {
    return pathname === "/projects" || pathname.startsWith("/projects/");
  }

  if (label === "Bookmarks") {
    return pathname === "/bookmarks";
  }

  if (label === "Search") {
    return pathname === "/search";
  }

  return pathname === href && href !== "/";
}
