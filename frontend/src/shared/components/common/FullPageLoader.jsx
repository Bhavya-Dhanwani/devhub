"use client";

import Image from "next/image";
import logo from "@/assets/images/logo.png";
import styles from "./FullPageLoader.module.css";

export function FullPageLoader() {
  return (
    <div className={styles.loader} role="status" aria-live="polite" aria-label="Loading">
      <div className={styles.spinnerShell}>
        <div className={styles.spinner} />
        <div className={styles.logoMark}>
          <Image src={logo} alt="DevHub" priority sizes="52px" />
        </div>
      </div>

      <p className={styles.loadingText}>
        LOADING
        <span aria-hidden="true" className={styles.dots}>
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </p>
    </div>
  );
}
