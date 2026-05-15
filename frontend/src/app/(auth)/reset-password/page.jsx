import { Suspense } from "react";
import { ResetPasswordForm } from "@/features/auth/ui/jsx/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
