"use client";

import { Loader2, ShieldCheck } from "lucide-react";
import { useVerifyEmailForm } from "../../hooks/useVerifyEmailForm";
import styles from "../css/AuthForm.module.css";

export function VerifyEmailForm({
  compact = false,
  description = "Enter the 6-digit OTP we sent when you created your account.",
  onVerified,
  title = "Verify your email",
}) {
  const { form, isLoading, message, onSubmit, resendOtp, status } = useVerifyEmailForm({ onVerified });

  return (
    <section className={`${styles.verifyPanel} ${compact ? styles.verifyPanelCompact : ""}`.trim()}>
      <div className={styles.verifyIcon}>
        <ShieldCheck size={20} />
      </div>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <form className={styles.verifyForm} onSubmit={form.handleSubmit(onSubmit)}>
        <input maxLength={6} placeholder="123456" {...form.register("otp")} />
        <button disabled={isLoading} type="submit">
          {isLoading ? <Loader2 className={styles.spin} /> : "Verify"}
        </button>
      </form>
      <small>{form.formState.errors.otp?.message}</small>

      {message ? <p className={status === "error" ? styles.errorBox : styles.successBox}>{message}</p> : null}

      <button className={styles.textButton} disabled={isLoading} type="button" onClick={resendOtp}>
        Resend OTP
      </button>
    </section>
  );
}
