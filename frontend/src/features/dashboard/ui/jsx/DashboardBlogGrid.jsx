import { BookText, MoreHorizontal, Pencil, Repeat2, Send, Trash2 } from "lucide-react";
import Link from "next/link";
import styles from "../css/DashboardBlogGrid.module.css";

export function DashboardBlogGrid({ error, isLoading, items, onConvertType, onDelete, onToggleStatus }) {
  if (isLoading) {
    return (
      <section className={styles.state} role="status">
        <BookText size={22} />
        <p>Loading work...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.state} role="alert">
        <BookText size={22} />
        <p>{error}</p>
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className={styles.state}>
        <BookText size={22} />
        <p>No blogs or projects found for this tab.</p>
      </section>
    );
  }

  return (
    <section className={styles.grid}>
      {items.map((item) => (
        <article className={`${styles.card} ${styles[item.tone]}`.trim()} key={`${item.contentType}-${item.id}`}>
          <div className={styles.cardTop}>
            <div className={styles.badge}>
              <BookText size={14} />
              {item.contentType} · {item.status}
            </div>

            <details className={styles.menu}>
              <summary aria-label={`Open options for ${item.title}`}>
                <MoreHorizontal size={18} />
              </summary>
              <div className={styles.menuPanel}>
                <Link href={item.editHref}>
                  <Pencil size={14} />
                  Edit
                </Link>
                <button type="button" onClick={() => onToggleStatus(item)}>
                  <Send size={14} />
                  {item.status === "published" ? "Move to draft" : "Publish"}
                </button>
                <button type="button" onClick={() => onConvertType(item)}>
                  <Repeat2 size={14} />
                  {item.contentType === "project" ? "Convert to blog" : "Convert to project"}
                </button>
                <button className={styles.dangerAction} type="button" onClick={() => onDelete(item)}>
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </details>
          </div>

          <Link className={styles.cardLink} href={item.previewHref}>
            <h3>{item.title}</h3>
            <p>{item.meta}</p>
          </Link>
        </article>
      ))}
    </section>
  );
}
