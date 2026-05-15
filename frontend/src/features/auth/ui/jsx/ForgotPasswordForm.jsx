"use client";

import { Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useForgotPasswordForm } from "../../hooks/useForgotPasswordForm";
import styles from "../css/AuthForm.module.css";

export function ForgotPasswordForm() {
  const { form, isLoading, message, onSubmit, status } = useForgotPasswordForm();

  return (
    <main className={styles.simplePage}>
      <section className={styles.miniCard}>
        <h1>Reset password</h1>
        <p>Enter your email and we will send a secure reset link.</p>

        <form className={styles.form} onSubmit={form.handleSubmit(onSubmit)}>
          <label className={styles.field}>
            <span>Email Address</span>
            <div className={styles.inputWrap}>
              <Mail className={styles.inputIcon} />
              <input type="email" placeholder="name@company.com" {...form.register("email")} />
            </div>
            <small>{form.formState.errors.email?.message}</small>
          </label>

          {message ? <p className={status === "error" ? styles.errorBox : styles.successBox}>{message}</p> : null}

          <button className={styles.submit} disabled={isLoading} type="submit">
            {isLoading ? <Loader2 className={styles.spin} /> : null}
            Send magic link
          </button>
        </form>

        <Link className={styles.backLink} href="/login">Back to login</Link>
      </section>
    </main>
  );
}
