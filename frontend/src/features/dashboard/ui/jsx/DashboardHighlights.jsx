import styles from "../css/DashboardHighlights.module.css";

export function DashboardHighlights({ items }) {
  return (
    <section className={styles.highlights}>
      {items.map((item) => (
        <button className={styles.item} key={item} type="button">
          <span>{item.slice(0, 1).toUpperCase()}</span>
          <small>{item}</small>
        </button>
      ))}
    </section>
  );
}
