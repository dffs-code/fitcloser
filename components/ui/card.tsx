import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "card rounded-3xl border border-slate-200/80 bg-white/95 p-6 backdrop-blur-xl transition dark:border-slate-700/60 dark:bg-slate-900/95",
        className
      )}
      {...props}
    />
  );
}
