import styles from "./BrandWordmark.module.css";

export function BrandWordmark({ className = "" }) {
  return (
    <span className={`${styles.wordmark} ${className}`}>
      <span className={styles.dev}>Dev</span>
      <span className={styles.hub}>Hub</span>
    </span>
  );
}
