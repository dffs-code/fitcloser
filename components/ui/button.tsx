import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "inline-flex items-center justify-center rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
  secondary:
    "inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
  ghost:
    "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return <button className={cn(variants[variant], className)} {...props} />;
}
