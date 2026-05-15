import "./globals.css";
import { ReactQueryProvider } from "@/core/providers/ReactQueryProvider";
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
          <ReactQueryProvider>
            <AuthBootstrap>{children}</AuthBootstrap>
          </ReactQueryProvider>
          <ToastProvider />
        </ReduxProvider>
      </body>
    </html>
  );
}
