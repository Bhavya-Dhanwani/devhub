"use client";

import { useAuthBootstrap } from "../../hooks/useAuthBootstrap";

export function AuthBootstrap({ children }) {
  useAuthBootstrap();

  return children;
}
