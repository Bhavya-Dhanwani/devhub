"use client";

import { FullPageLoader } from "@/shared/components/common/FullPageLoader";
import { useAuthBootstrap } from "../../hooks/useAuthBootstrap";

export function AuthBootstrap({ children }) {
  const { bootstrapped } = useAuthBootstrap();

  if (!bootstrapped) {
    return <FullPageLoader />;
  }

  return children;
}
