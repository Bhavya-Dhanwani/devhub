"use client";

import { Loader2, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { BrandWordmark } from "@/shared/components/common/BrandWordmark";
import { useResetPasswordForm } from "../../hooks/useResetPasswordForm";
import styles from "../css/AuthForm.module.css";

export function ResetPasswordForm() {
  const { form, isLoading, message, onSubmit, status, token } = useResetPasswordForm();

  return (
    <main className={styles.simplePage}>
      <section className={styles.miniCard}>
        <h1>New password</h1>
        <p>Create a new password for your <BrandWordmark /> account.</p>

        {!token ? <p className={styles.errorBox}>Reset token is missing.</p> : null}

        <form className={styles.form} onSubmit={form.handleSubmit(onSubmit)}>
          <label className={styles.field}>
            <span>Password</span>
            <div className={styles.inputWrap}>
              <LockKeyhole className={styles.inputIcon} />
              <input type="password" placeholder="password" {...form.register("password")} />
            </div>
            <small>{form.formState.errors.password?.message}</small>
          </label>

          {message ? <p className={status === "error" ? styles.errorBox : styles.successBox}>{message}</p> : null}

          <button className={styles.submit} disabled={isLoading || !token} type="submit">
            {isLoading ? <Loader2 className={styles.spin} /> : null}
            Reset password
          </button>
        </form>

        <Link className={styles.backLink} href="/login">Back to login</Link>
      </section>
    </main>
  );
}
