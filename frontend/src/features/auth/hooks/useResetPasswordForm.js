"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/core/api/apiClient";
import { authApi } from "../api/auth.api";
import { resetPasswordSchema } from "./auth.schemas";

export function useResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "" },
  });

  const onSubmit = async (values) => {
    setStatus("loading");
    setMessage("");

    try {
      await authApi.resetPassword({ token, password: values.password });
      setStatus("success");
      setMessage("Password reset. Redirecting to login...");
      window.setTimeout(() => router.replace("/login"), 900);
    } catch (error) {
      const errorMessage = getApiErrorMessage(error) || "Could not reset password.";
      setStatus("error");
      setMessage(errorMessage);
      toast.error(errorMessage);
    }
  };

  return {
    form,
    isLoading: status === "loading",
    message,
    status,
    token,
    onSubmit,
  };
}
