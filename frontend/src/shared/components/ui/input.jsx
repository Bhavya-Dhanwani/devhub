import * as React from "react";
import { cn } from "@/shared/lib/utils";

export const Input = React.forwardRef(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--foreground)] outline-none transition-all duration-300 placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:bg-white/[0.075] focus:ring-4 focus:ring-[color:var(--ring)]/15",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
