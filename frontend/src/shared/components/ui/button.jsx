import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";

const buttonVariants = cva(
  "inline-flex h-11 items-center justify-center gap-2 rounded-[14px] px-5 text-sm font-semibold tracking-[-0.01em] transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
  {
    variants: {
      variant: {
        default: "bg-[var(--primary)] text-white shadow-[0_14px_44px_rgba(139,92,246,0.28)] hover:-translate-y-0.5 hover:bg-[var(--primary-light)] hover:shadow-[0_18px_54px_rgba(139,92,246,0.34)]",
        secondary: "border border-[var(--border)] bg-white/[0.04] text-[var(--foreground)] backdrop-blur-md hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:bg-white/[0.075]",
        ghost: "text-[var(--foreground)] hover:bg-white/[0.06]",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-3",
        lg: "h-12 px-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export const Button = React.forwardRef(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  ),
);

Button.displayName = "Button";
