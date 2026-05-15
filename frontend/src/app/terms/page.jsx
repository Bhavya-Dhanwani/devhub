import { LegalPage } from "@/features/legal/ui/LegalPage";

export const metadata = {
  title: "Terms and Conditions | DevHub",
  description: "Terms and conditions for using DevHub.",
};

const sections = [
  {
    title: "1. Using DevHub",
    body: [
      "DevHub is a workspace for developers to create, save, publish, and read technical blogs. By using DevHub, you agree to use the platform responsibly and follow these terms.",
      "You must provide accurate account information and keep your login credentials secure. You are responsible for activity that happens through your account.",
    ],
  },
  {
    title: "2. Accounts and email verification",
    body: [
      "Some features may require signup, login, and email verification. We may send one-time passwords, password reset emails, and account-related messages to the email address you provide.",
      "We may limit or remove access if an account is used for spam, abuse, impersonation, unauthorized access, or activity that harms DevHub or its users.",
    ],
  },
  {
    title: "3. Your content",
    body: [
      "You own the blogs, drafts, images, tags, and profile content you create. You give DevHub permission to store, display, process, and publish that content as needed to operate the service.",
      "Do not upload content that is illegal, abusive, misleading, infringing, malicious, or designed to compromise systems or users.",
    ],
  },
  {
    title: "4. Publishing and moderation",
    body: [
      "Published blogs may be visible to other users. Drafts remain part of your workspace unless you publish them or otherwise share them through the product.",
      "We may remove or restrict content that violates these terms, creates security risk, or disrupts the product experience.",
    ],
  },
  {
    title: "5. Service availability",
    body: [
      "We work to keep DevHub available and reliable, but we do not guarantee uninterrupted access. Features may change, pause, or be removed as the product evolves.",
      "DevHub is provided as-is. To the fullest extent allowed by law, we are not responsible for indirect, incidental, or consequential damages from using the service.",
    ],
  },
  {
    title: "6. Contact",
    body: [
      "For questions about these terms, account access, or content concerns, contact the DevHub team through the support channel provided in the app.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Terms"
      title="Terms and Conditions"
      intro="These terms explain the basic rules for using DevHub, creating an account, and publishing content on the platform."
      sections={sections}
    />
  );
}
