"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/core/store/hooks";
import { bootstrapAuth } from "../state/authSlice";

export function useAuthBootstrap() {
  const dispatch = useAppDispatch();
  const bootstrapped = useAppSelector((state) => state.auth.bootstrapped);

  useEffect(() => {
    if (!bootstrapped) {
      dispatch(bootstrapAuth());
    }
  }, [bootstrapped, dispatch]);
  return { bootstrapped };
}
