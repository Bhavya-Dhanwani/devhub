import { AtSign, ChevronDown, Settings } from "lucide-react";
import Image from "next/image";
import { VerifyEmailForm } from "@/features/auth/ui/jsx/VerifyEmailForm";
import { Button } from "@/shared/components/ui/button";
import styles from "../css/DashboardProfileHeader.module.css";

export function DashboardProfileHeader({ stats, user, username }) {
  return (
    <header className={styles.header}>
      <div className={styles.avatarWrap}>
        <div className={styles.avatar}>
          {user?.avatar ? (
            <Image
              src={user.avatar}
              alt={`${user?.name || "Developer"} avatar`}
              fill
              className={styles.avatarImage}
              unoptimized
            />
          ) : (
            <span>{(user?.name || "D").slice(0, 1).toUpperCase()}</span>
          )}
        </div>
      </div>

      <div className={styles.main}>
        <div className={styles.mobileTopBar}>
          <button className={styles.mobileIconButton} type="button" aria-label="Settings">
            <Settings size={20} />
          </button>
          <p>
            {username}
            <ChevronDown size={14} />
          </p>
          <button className={styles.mobileIconButton} type="button" aria-label="Threads">
            <AtSign size={20} />
          </button>
        </div>

        <div className={styles.identityRow}>
          <h1>{username}</h1>
          <button className={styles.iconButton} type="button" aria-label="Profile settings">
            <Settings size={18} />
          </button>
        </div>

        <div className={styles.stats}>
          <p><strong>{stats.posts}</strong> posts</p>
          <p><strong>{stats.blogs}</strong> blogs</p>
          <p><strong>{stats.drafts}</strong> drafts</p>
          <p><strong>{stats.followers}</strong> followers</p>
          <p><strong>{stats.following}</strong> following</p>
        </div>

        <div className={styles.mobileHero}>
          <div className={styles.mobileAvatar}>
            {user?.avatar ? (
              <Image
                src={user.avatar}
                alt={`${user?.name || "Developer"} avatar`}
                fill
                className={styles.avatarImage}
                unoptimized
              />
            ) : (
              <span>{(user?.name || "D").slice(0, 1).toUpperCase()}</span>
            )}
          </div>
          <div className={styles.mobileStats}>
            <p><strong>{stats.posts}</strong><span>posts</span></p>
            <p><strong>{stats.followers}</strong><span>followers</span></p>
            <p><strong>{stats.following}</strong><span>following</span></p>
          </div>
        </div>

        <p className={styles.name}>{user?.name || "Developer"}</p>
        <p className={styles.bio}>
          Building useful products, sharing blog breakdowns, and shipping clean writer-first experiences.
        </p>
        <p className={styles.link}>{user?.email || "you@devhub.app"}</p>

        <div className={styles.actions}>
          <Button variant="secondary">Edit profile</Button>
          <Button variant="secondary">View archive</Button>
          <Button variant="secondary">Ad tools</Button>
        </div>

        <p className={styles.insight}>30K views in the last 30 days. <strong>View insights</strong></p>

        {!user?.isEmailVerified ? (
          <div className={styles.verifyStrip}>
            <VerifyEmailForm
              compact
              title="Verify email to publish blogs"
              description="Enter your OTP to unlock publishing."
            />
          </div>
        ) : null}
      </div>
    </header>
  );
}
