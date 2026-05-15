"use client";

import { BrandWordmark } from "@/shared/components/common/BrandWordmark";
import { useAuthGuard } from "../../hooks/useAuthGuard";

export function AuthGuard({ children, fallback = null, redirectToLogin = true }) {
  const { isAuthenticated, isRestoring } = useAuthGuard({ redirectToLogin });

  if (isRestoring) {
    return (
      <main className="grid min-h-screen place-items-center bg-[var(--background)] px-6 text-[var(--foreground)]">
        <section
          className="grid w-full max-w-[21rem] place-items-center gap-4 rounded-[1.2rem] border border-[color-mix(in_srgb,var(--foreground)_11%,transparent)] bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)] p-6"
          role="status"
          aria-live="polite"
        >
          <div className="inline-grid grid-flow-col items-center gap-2" aria-hidden="true">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[var(--primary-light)]" />
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[var(--primary-light)] [animation-delay:120ms]" />
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[var(--primary-light)] [animation-delay:240ms]" />
          </div>
          <p className="inline-flex items-center gap-1 text-xs font-semibold tracking-[0.18em] text-[var(--muted-foreground)]">
            <span className="uppercase">Loading</span> <BrandWordmark />
          </p>
        </section>
      </main>
    );
  }

  if (!isAuthenticated) {
    return fallback;
  }

  return children;
}
