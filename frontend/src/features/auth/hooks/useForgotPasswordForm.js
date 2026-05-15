"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/core/api/apiClient";
import { authApi } from "../api/auth.api";
import { forgotPasswordSchema } from "./auth.schemas";

export function useForgotPasswordForm() {
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values) => {
    setStatus("loading");
    setMessage("");

    try {
      const response = await authApi.forgotPassword(values.email);
      setStatus("success");
      setMessage(response.message);
    } catch (error) {
      const errorMessage = getApiErrorMessage(error) || "Could not send reset email.";
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
    onSubmit,
  };
}
