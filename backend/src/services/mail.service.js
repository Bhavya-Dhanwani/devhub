import { Resend } from "resend";
import { env } from "../config/env.js";

let resendClient;

const emailTheme = {
  background: "#05070a",
  panel: "#090d12",
  border: "#1e293b",
  foreground: "#f8fafc",
  muted: "#94a3b8",
  primary: "#22e58f",
  primaryLight: "#76ffb4",
  accentForeground: "#04110b",
};

function getResendClient() {
  if (!resendClient) {
    resendClient = new Resend(env.RESEND_API_KEY);
  }

  return resendClient;
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildEmailLayout({ preheader, eyebrow, title, subtitle, bodyHtml, ctaLabel, ctaUrl, footerNote }) {
  const safePreheader = escapeHtml(preheader);
  const safeEyebrow = escapeHtml(eyebrow);
  const safeTitle = escapeHtml(title);
  const safeSubtitle = escapeHtml(subtitle);
  const safeCtaLabel = ctaLabel ? escapeHtml(ctaLabel) : "";
  const safeCtaUrl = ctaUrl ? escapeHtml(ctaUrl) : "";
  const safeFooterNote = escapeHtml(footerNote);
  const ctaHtml = safeCtaLabel && safeCtaUrl
    ? `<tr><td style="padding-top:24px;">
        <a href="${safeCtaUrl}" style="display:inline-block;padding:12px 20px;border-radius:12px;background:${emailTheme.primary};color:${emailTheme.accentForeground};font-weight:800;font-size:14px;text-decoration:none;">
          ${safeCtaLabel}
        </a>
      </td></tr>`
    : "";

  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:${emailTheme.background};color:${emailTheme.foreground};font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${safePreheader}</span>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${emailTheme.background};padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;border:1px solid ${emailTheme.border};border-radius:18px;background:${emailTheme.panel};overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 8px;">
                <p style="margin:0;color:${emailTheme.primaryLight};font-size:12px;letter-spacing:0.08em;text-transform:uppercase;font-weight:800;">${safeEyebrow}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px;">
                <h1 style="margin:0;font-size:30px;line-height:1.15;letter-spacing:-0.02em;color:${emailTheme.foreground};font-weight:900;">${safeTitle}</h1>
                <p style="margin:12px 0 0;color:${emailTheme.muted};font-size:15px;line-height:1.55;">${safeSubtitle}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px 0;color:${emailTheme.foreground};font-size:15px;line-height:1.65;">
                ${bodyHtml}
              </td>
            </tr>
            ${ctaHtml}
            <tr>
              <td style="padding:24px 28px 0;">
                <div style="height:1px;background:${emailTheme.border};"></div>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 28px 28px;color:${emailTheme.muted};font-size:12px;line-height:1.6;">
                <p style="margin:0;">${safeFooterNote}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function sendMail({ to, subject, html, text }) {
  if (!env.RESEND_API_KEY) {
    console.log(`[mail skipped] ${subject} -> ${to}: ${text}`);
    return;
  }

  const { error } = await getResendClient().emails.send({
    from: env.SENDER_EMAIL,
    to,
    subject,
    text,
    html,
  });

  if (error) {
    throw new Error(error.message || "Resend failed to send email.");
  }
}

export async function sendSignupOtpEmail({ to, name, otp }) {
  const safeName = escapeHtml(name || "there");
  const safeOtp = escapeHtml(otp);
  const html = buildEmailLayout({
    preheader: `Your DevHub verification code is ${otp}.`,
    eyebrow: "Email Verification",
    title: "Confirm your DevHub account",
    subtitle: "Use the one-time code below to verify your email and finish setting up your account.",
    bodyHtml: `<p style="margin:0 0 12px;">Hey ${safeName},</p>
      <p style="margin:0 0 16px;">Enter this OTP in DevHub:</p>
      <p style="margin:0;display:inline-block;padding:14px 18px;border-radius:12px;border:1px solid ${emailTheme.border};background:#0f172a;color:${emailTheme.primaryLight};font-size:28px;letter-spacing:0.24em;font-weight:900;">
        ${safeOtp}
      </p>
      <p style="margin:16px 0 0;color:${emailTheme.muted};">This OTP expires in 10 minutes.</p>`,
    footerNote: "If you did not create this account, you can safely ignore this email.",
  });

  await sendMail({
    to,
    subject: "Verify your DevHub email",
    text: `Hi ${name}, your DevHub verification OTP is ${otp}. It expires in 10 minutes.`,
    html,
  });
}

export async function sendWelcomeEmail({ to, name }) {
  const safeName = escapeHtml(name || "there");
  const html = buildEmailLayout({
    preheader: "Welcome to DevHub. Your account is ready.",
    eyebrow: "Welcome",
    title: "You are in. Welcome to DevHub.",
    subtitle: "Your account is ready. Start sharing ideas, writing blogs, and building your dev profile.",
    bodyHtml: `<p style="margin:0;">Great to have you here, ${safeName}. Your email is verified and your workspace is ready.</p>`,
    ctaLabel: "Open DevHub",
    ctaUrl: env.CLIENT_URL,
    footerNote: "You are receiving this because you signed up for DevHub.",
  });

  await sendMail({
    to,
    subject: "Welcome to DevHub",
    text: `Welcome to DevHub, ${name}. Your account is ready.`,
    html,
  });
}

export async function sendPasswordResetEmail({ to, name, resetUrl }) {
  const safeName = escapeHtml(name || "there");
  const html = buildEmailLayout({
    preheader: "Reset your DevHub password.",
    eyebrow: "Security",
    title: "Reset your password",
    subtitle: "Use the secure button below to choose a new password for your DevHub account.",
    bodyHtml: `<p style="margin:0;">Hi ${safeName},</p>
      <p style="margin:12px 0 0;">We received a request to reset your password. This link expires in 15 minutes.</p>`,
    ctaLabel: "Reset password",
    ctaUrl: resetUrl,
    footerNote: "If you did not request this, no changes were made and you can ignore this email.",
  });

  await sendMail({
    to,
    subject: "Reset your DevHub password",
    text: `Hi ${name}, reset your DevHub password here: ${resetUrl}`,
    html,
  });
}
