import { LegalPage } from "@/features/legal/ui/LegalPage";

export const metadata = {
  title: "Privacy Policy | DevHub",
  description: "Privacy policy for DevHub accounts, blogs, and workspace data.",
};

const sections = [
  {
    title: "1. Information we collect",
    body: [
      "We collect the information needed to run DevHub, including your name, email address, password credentials, profile image, blog drafts, published posts, tags, categories, uploaded images, and account activity.",
      "We also collect basic technical information such as browser details, device information, IP address, cookies, and logs that help keep the product secure and reliable.",
    ],
  },
  {
    title: "2. How we use information",
    body: [
      "We use your information to create and secure your account, authenticate sessions, send verification and password reset emails, save drafts, publish blogs, show dashboard stats, and improve product performance.",
      "We may use operational logs to troubleshoot errors, prevent abuse, and protect DevHub users from unauthorized access.",
    ],
  },
  {
    title: "3. Cookies and authentication",
    body: [
      "DevHub uses cookies and tokens to keep you signed in and protect authenticated routes. Logging out clears the refresh cookie from your browser and revokes the active refresh token where possible.",
      "If cookies are disabled, some account features may not work correctly.",
    ],
  },
  {
    title: "4. Content visibility",
    body: [
      "Published blogs may be visible to other users and visitors. Drafts, unpublished posts, and private account data are used to provide your workspace and are not intended for public display.",
      "Profile information such as your name, avatar, and author details may appear with your published content.",
    ],
  },
  {
    title: "5. Service providers",
    body: [
      "We may use trusted service providers for hosting, databases, email delivery, media storage, analytics, and security. These providers process information only as needed to support DevHub.",
      "Uploaded images may be stored with a media provider, and account emails may be sent through an email delivery provider.",
    ],
  },
  {
    title: "6. Your choices",
    body: [
      "You can update account details, delete drafts or blogs, and log out from your account. You may request help with account access or data concerns through the support channel provided in the app.",
      "We keep information for as long as needed to provide the service, comply with obligations, resolve disputes, and protect the platform.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Privacy"
      title="Privacy Policy"
      intro="This policy explains what DevHub collects, how the information is used, and what choices you have while using the platform."
      sections={sections}
    />
  );
}
