"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@/core/store/hooks";
import { getApiErrorMessage } from "@/core/api/apiClient";
import { loginUser, signupUser } from "../state/authSlice";
import { loginSchema, signupSchema } from "./auth.schemas";

export function useAuthForm(mode) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { status } = useAppSelector((state) => state.auth);
  const isSignup = mode === "signup";
  const isLoading = status === "loading";
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarError, setAvatarError] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);

  const form = useForm({
    resolver: zodResolver(isSignup ? signupSchema : loginSchema),
    defaultValues: isSignup
      ? { name: "", email: "", password: "", avatar: null }
      : { email: "", password: "" },
  });

  const onAvatarChange = (event) => {
    const file = event.target.files?.[0];
    setAvatarError("");

    if (!file) {
      setAvatarPreview("");
      form.setValue("avatar", null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setAvatarError("Please choose an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("Keep the profile picture under 2 MB.");
      event.target.value = "";
      return;
    }

    const reader = new window.FileReader();
    reader.onload = () => {
      setAvatarPreview(String(reader.result || ""));
      form.setValue("avatar", file, { shouldDirty: true, shouldValidate: true });
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (values) => {
    const action = isSignup
      ? await dispatch(signupUser(values))
      : await dispatch(loginUser(values));

    if (loginUser.fulfilled.match(action)) {
      router.replace("/dashboard");
      return;
    }

    if (signupUser.fulfilled.match(action)) {
      if (action.payload.user?.isEmailVerified) {
        router.replace("/dashboard");
      } else {
        setShowOtpModal(true);
      }
      return;
    }

    toast.error(action.payload || getApiErrorMessage(action.error));
  };

  const closeOtpModal = () => {
    setShowOtpModal(false);
  };

  const onEmailVerified = () => {
    setShowOtpModal(false);
    router.replace("/dashboard");
  };

  return {
    avatarError,
    avatarPreview,
    closeOtpModal,
    form,
    isLoading,
    isSignup,
    onEmailVerified,
    onAvatarChange,
    onSubmit,
    showOtpModal,
  };
}
