import Link from "next/link";
import { AppSidebar } from "@/shared/components/layout/AppSidebar";
import { BrandWordmark } from "@/shared/components/common/BrandWordmark";
import styles from "./LegalPage.module.css";

export function LegalPage({ eyebrow, title, intro, sections }) {
  return (
    <main className={styles.shell}>
      <AppSidebar collapsed />

      <section className={styles.content}>
        <article className={styles.document}>
          <header className={styles.header}>
            <p>{eyebrow}</p>
            <h1>{title}</h1>
            <span>Last updated: May 15, 2026</span>
            <div>
              <Link href="/">Home</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
            </div>
          </header>

          <p className={styles.intro}>{intro}</p>

          <div className={styles.notice}>
            <strong><BrandWordmark /> policy note</strong>
            <span>
              This page explains the current product rules in plain language. It is not legal advice.
            </span>
          </div>

          <div className={styles.sections}>
            {sections.map((section) => (
              <section key={section.title} className={styles.section}>
                <h2>{section.title}</h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
