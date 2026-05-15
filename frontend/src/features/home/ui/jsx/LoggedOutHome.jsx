import Link from "next/link";
import { BrandWordmark } from "@/shared/components/common/BrandWordmark";
import styles from "../css/HomePage.module.css";

export function LoggedOutHome() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroCopy}>
        <h1>
          Write to think.
          <span>Publish to connect.</span>
        </h1>
        <p>
          AI can generate a thousand articles a minute. But it can&apos;t do your
          thinking for you. <BrandWordmark /> is a community of <strong>builders, engineers,
          and tech leaders</strong> who write to sharpen ideas, share what they
          learned, and grow with people who care about the craft.
        </p>
        <p>
          <strong>Your blog is your reputation</strong> — start building it.
        </p>
        <Link href="/write">Start your blog</Link>
      </div>
      <HeroIllustration />
    </section>
  );
}

function HeroIllustration() {
  return (
    <div className={styles.illustration} aria-label="Developer writing illustration">
      <div className={styles.board}>
        <span />
        <span />
        <span />
      </div>
      <div className={styles.paperOne} />
      <div className={styles.paperTwo} />
      <div className={styles.person}>
        <div className={styles.head} />
        <div className={styles.hair} />
        <div className={styles.body} />
        <div className={styles.arm} />
      </div>
      <div className={styles.desk} />
      <div className={styles.keyboard} />
    </div>
  );
}
