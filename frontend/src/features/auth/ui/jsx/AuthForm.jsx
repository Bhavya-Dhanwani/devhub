"use client";

import { Camera, HelpCircle, Loader2, LockKeyhole, Mail, ShieldCheck, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/images/logo.png";
import { BrandWordmark } from "@/shared/components/common/BrandWordmark";
import { useAuthForm } from "../../hooks/useAuthForm";
import { VerifyEmailForm } from "./VerifyEmailForm";
import styles from "../css/AuthForm.module.css";

export function AuthForm({ mode }) {
  const {
    avatarError,
    avatarPreview,
    closeOtpModal,
    error,
    form,
    isLoading,
    isSignup,
    onEmailVerified,
    onAvatarChange,
    onSubmit,
    showOtpModal,
  } = useAuthForm(mode);

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/">
          <span className={styles.brandMark}>
            <Image src={logo} alt="" priority sizes="28px" />
          </span>
          <BrandWordmark />
        </Link>

        <nav className={styles.nav} aria-label="Auth navigation">
          <Link href="/">Documentation</Link>
          <Link href="/">Pricing</Link>
        </nav>

        <Link className={styles.helpLink} href="/" aria-label="Help">
          <HelpCircle size={20} />
        </Link>
      </header>

      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.cardLogo}>
            <Image src={logo} alt="DevHub" priority sizes="64px" />
          </div>

          <div className={styles.heading}>
            <h1>{isSignup ? "Create Account" : "Welcome Back"}</h1>
            <p>
              {isSignup
                ? "Sign up to create your developer workspace"
                : "Sign in to access your dashboard"}
            </p>
          </div>

          <form className={styles.form} onSubmit={form.handleSubmit(onSubmit)}>
            {isSignup ? (
              <>
                <div className={styles.avatarRow}>
                  <div className={styles.avatarPreview}>
                    {avatarPreview ? (
                      <Image src={avatarPreview} alt="" width={52} height={52} unoptimized />
                    ) : (
                      <User size={24} />
                    )}
                  </div>
                  <label className={styles.avatarButton}>
                    <Camera size={16} />
                    Profile picture
                    <input accept="image/*" type="file" onChange={onAvatarChange} />
                  </label>
                </div>
                <small className={styles.avatarError}>{avatarError}</small>

                <label className={styles.field}>
                  <span>Full Name</span>
                  <div className={styles.inputWrap}>
                    <User className={styles.inputIcon} />
                    <input
                      autoComplete="name"
                      placeholder="Jane Developer"
                      {...form.register("name")}
                    />
                  </div>
                  <small>{form.formState.errors.name?.message}</small>
                </label>
              </>
            ) : null}

            <label className={styles.field}>
              <span>Email Address</span>
              <div className={styles.inputWrap}>
                <Mail className={styles.inputIcon} />
                <input
                  autoComplete="email"
                  placeholder="name@company.com"
                  type="email"
                  {...form.register("email")}
                />
              </div>
              <small>{form.formState.errors.email?.message}</small>
            </label>

            <label className={styles.field}>
              <span className={styles.passwordLabel}>
                Password
                {!isSignup ? (
                  <Link className={styles.textButton} href="/forgot-password">
                    Forgot password?
                  </Link>
                ) : null}
              </span>
              <div className={styles.inputWrap}>
                <LockKeyhole className={styles.inputIcon} />
                <input
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  placeholder="password"
                  type="password"
                  {...form.register("password")}
                />
              </div>
              <small>{form.formState.errors.password?.message}</small>
            </label>

            {error ? <p className={styles.errorBox}>{error}</p> : null}

            <button className={styles.submit} disabled={isLoading} type="submit">
              {isLoading ? <Loader2 className={styles.spin} /> : null}
              {isSignup ? "Sign Up" : "Sign In"}
            </button>
          </form>

          <p className={styles.switchText}>
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <Link href={isSignup ? "/login" : "/signup"}>
              {isSignup ? "Sign in" : "Sign up"}
            </Link>
          </p>
        </div>

        <div className={styles.assurance}>
          <span>
            <ShieldCheck size={16} />
            Secure AES-256
          </span>
          <span>
            <ShieldCheck size={16} />
            SOC2 Compliant
          </span>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2024 <BrandWordmark /> Inc.</p>
        <div>
          <Link href="/">Privacy Policy</Link>
          <Link href="/">Terms of Service</Link>
          <Link href="/">Contact Support</Link>
        </div>
      </footer>

      {isSignup && showOtpModal ? (
        <div className={styles.modalBackdrop} role="presentation">
          <div
            aria-labelledby="otp-modal-title"
            aria-modal="true"
            className={styles.modalCard}
            role="dialog"
          >
            <button
              aria-label="Close verification popup"
              className={styles.modalClose}
              type="button"
              onClick={closeOtpModal}
            >
              <X size={18} />
            </button>
            <VerifyEmailForm
              compact
              title="One more step: verify your email"
              description="Enter the OTP sent to your email to complete signup and continue to your dashboard."
              onVerified={onEmailVerified}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
