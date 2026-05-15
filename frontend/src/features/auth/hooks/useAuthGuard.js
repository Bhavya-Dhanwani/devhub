"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/core/store/hooks";
import { selectAuth } from "../state/authSlice";

export function useAuthGuard({ redirectToLogin = true } = {}) {
  const router = useRouter();
  const { bootstrapped, status } = useAppSelector(selectAuth);
  const isAuthenticated = status === "authenticated";
  const isRestoring = !bootstrapped || status === "loading";

  useEffect(() => {
    if (redirectToLogin && bootstrapped && !isAuthenticated) {
      router.replace("/login");
    }
  }, [bootstrapped, isAuthenticated, redirectToLogin, router]);

  return {
    isAuthenticated,
    isRestoring,
  };
}
