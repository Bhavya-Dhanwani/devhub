import { BookText, Grid3x3 } from "lucide-react";
import styles from "../css/DashboardTabs.module.css";

export function DashboardTabs({ activeTab, tabs, onTabChange }) {
  return (
    <section className={styles.tabs}>
      {tabs.map((tab, index) => (
        <button
          className={activeTab === tab.id ? styles.active : ""}
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
        >
          {index === 0 ? <Grid3x3 size={16} /> : <BookText size={16} />}
          <span className={styles.label}>{tab.label}</span>
        </button>
      ))}
    </section>
  );
}
