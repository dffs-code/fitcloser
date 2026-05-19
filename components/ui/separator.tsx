import * as React from "react";
import { cn } from "@/lib/utils";

export function Separator({ className, ...props }: React.HTMLAttributes<HTMLHRElement>) {
  return <hr className={cn("my-6 border-slate-200/80 dark:border-slate-800", className)} {...props} />;
}
