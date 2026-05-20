import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "accent";
}

const badgeVariants: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700",
  success: "rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700",
  warning: "rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700",
  accent: "rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700"
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return <span className={cn(badgeVariants[variant], className)} {...props} />;
}
