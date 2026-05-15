import "./globals.css";
import { ReduxProvider } from "@/core/providers/ReduxProvider";
import { ToastProvider } from "@/core/providers/ToastProvider";
import { AuthBootstrap } from "@/features/auth/ui/jsx/AuthBootstrap";

export const metadata = {
  title: "DevHub",
  description: "A protected developer workspace.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <AuthBootstrap>{children}</AuthBootstrap>
          <ToastProvider />
        </ReduxProvider>
      </body>
    </html>
  );
}
