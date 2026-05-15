"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useAppDispatch } from "@/core/store/hooks";
import { getApiErrorMessage } from "@/core/api/apiClient";
import { authApi } from "../api/auth.api";
import { verifyEmailUser } from "../state/authSlice";
import { verifyEmailSchema } from "./auth.schemas";

export function useVerifyEmailForm(options = {}) {
  const { onVerified } = options;
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const form = useForm({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { otp: "" },
  });

  const onSubmit = async (values) => {
    setStatus("loading");
    setMessage("");
    const action = await dispatch(verifyEmailUser(values));

    if (verifyEmailUser.fulfilled.match(action)) {
      setStatus("success");
      setMessage(action.payload.message);
      onVerified?.(action.payload);
      return;
    }

    const errorMessage = action.payload || getApiErrorMessage(action.error);
    setStatus("error");
    setMessage(errorMessage);
    toast.error(errorMessage);
  };

  const resendOtp = async () => {
    setStatus("loading");
    setMessage("");

    try {
      const response = await authApi.resendVerificationOtp();
      setStatus("success");
      setMessage(response.message);
    } catch (error) {
      const errorMessage = getApiErrorMessage(error) || "Could not resend OTP.";
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
    resendOtp,
  };
}
