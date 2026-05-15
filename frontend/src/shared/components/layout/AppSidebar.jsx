"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Compass,
  FileText,
  Folder,
  Home,
  Link2,
  Menu,
  MessageCircle,
  Search,
  Trophy,
} from "lucide-react";
import logo from "@/assets/images/logo.png";
import { useAppSelector } from "@/core/store/hooks";
import { selectAuth } from "@/features/auth/state/authSlice";
import { BrandWordmark } from "@/shared/components/common/BrandWordmark";
import styles from "./AppSidebar.module.css";

const mainItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/blogs", icon: Folder, label: "Blogs" },
  { href: "/", icon: Bookmark, label: "Bookmarks" },
  { href: "/", icon: MessageCircle, label: "Forums" },
  { href: "/", icon: Trophy, label: "Hackathons" },
  { href: "/", icon: Search, label: "Search", shortcut: "Ctrl K" },
];

const authorItems = [
  { href: "/write/new", icon: Link2, label: "Write" },
  { href: "/dashboard", icon: FileText, label: "Dashboard" },
];

const sidebarStorageKeys = {
  desktop: "devhub-sidebar-collapsed-desktop",
  mobile: "devhub-sidebar-collapsed-mobile",
};

export function AppSidebar({ collapsed = false }) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const pathname = usePathname();
  const { status, user } = useAppSelector(selectAuth);
  const isLoggedIn = status === "authenticated";

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 760px)");

    const syncSidebarMode = () => {
      const storageKey = getSidebarStorageKey(mobileQuery.matches);
      const savedState = window.localStorage.getItem(storageKey);
      const nextCollapsed = savedState === null ? mobileQuery.matches || collapsed : savedState === "true";

      setIsCollapsed(nextCollapsed);

      if (savedState === null) {
        window.localStorage.setItem(storageKey, String(nextCollapsed));
      }
    };

    syncSidebarMode();
    mobileQuery.addEventListener("change", syncSidebarMode);

    return () => {
      mobileQuery.removeEventListener("change", syncSidebarMode);
    };
  }, [collapsed]);

  const updateSidebar = (value) => {
    setIsCollapsed((current) => {
      const nextCollapsed = typeof value === "function" ? value(current) : value;
      const isMobile = window.matchMedia("(max-width: 760px)").matches;

      window.localStorage.setItem(getSidebarStorageKey(isMobile), String(nextCollapsed));

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
          <BrandWordmark />
        </Link>
        <div className={styles.mobileActions}>
          <Search size={19} />
          <Bell size={18} />
          <Link2 size={18} />
          <Link className={styles.mobileUser} href="/dashboard">B</Link>
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

      {!isCollapsed ? (
        <div className={styles.newsCard}>
          <div>
            <span>What&apos;s new</span>
            <button type="button" aria-label="Dismiss update">×</button>
          </div>
          <strong>GraphQL API access is moving to a paid plan</strong>
          <p><BrandWordmark /> API access is changing soon. Early builders keep free credits.</p>
        </div>
      ) : null}

      <div className={isCollapsed ? styles.collapsedFooter : styles.sidebarFooter}>
        <Link className={isCollapsed ? styles.iconItem : styles.exploreLink} href="#feed" title="Explore">
          <Compass size={16} />
          {!isCollapsed ? (
            <>
              Explore
              <span>New</span>
            </>
          ) : null}
        </Link>

        {isLoggedIn ? (
          <>
            <Link className={isCollapsed ? styles.iconItem : styles.notificationLink} href="/dashboard" title="Notifications">
              <Bell size={16} />
              {!isCollapsed ? "Notifications" : null}
            </Link>
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
              <Link href="/">Terms</Link>
              <Link href="/">Privacy</Link>
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

function getSidebarStorageKey(isMobile) {
  return isMobile ? sidebarStorageKeys.mobile : sidebarStorageKeys.desktop;
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

function isActive(pathname, href, label) {
  if (label === "Home") {
    return pathname === "/";
  }

  if (label === "Blogs") {
    return pathname === "/blogs" || pathname.startsWith("/blogs/");
  }

  return pathname === href && href !== "/";
}
