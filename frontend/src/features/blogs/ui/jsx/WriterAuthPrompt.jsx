"use client";

import Link from "next/link";
import { LockKeyhole, LogIn, UserPlus } from "lucide-react";
import { BrandWordmark } from "@/shared/components/common/BrandWordmark";
import { AppSidebar } from "@/shared/components/layout/AppSidebar";
import styles from "../css/WriterAuthPrompt.module.css";

export function WriterAuthPrompt() {
  return (
    <main className={styles.shell}>
      <AppSidebar collapsed />
      <section className={styles.content}>
        <div className={styles.backdrop} aria-hidden="true" />
        <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="writer-auth-title">
          <div className={styles.icon}>
            <LockKeyhole size={24} />
          </div>
          <p className={styles.kicker}>
            <BrandWordmark /> writers only
          </p>
          <h1 id="writer-auth-title">Login to write blogs</h1>
          <p className={styles.copy}>
            Create drafts, publish posts, add covers, and manage your writing space after signing in.
          </p>
          <div className={styles.actions}>
            <Link className={styles.primaryAction} href="/login">
              <LogIn size={17} />
              Login
            </Link>
            <Link className={styles.secondaryAction} href="/signup">
              <UserPlus size={17} />
              Sign up
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
