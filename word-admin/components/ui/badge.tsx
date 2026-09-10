import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "neutral" | "danger" | "outline";

const styles: Record<BadgeVariant, string> = {
  default: "bg-primary/10 text-primary",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  warning: "bg-amber-50 text-amber-700 ring-amber-600/15",
  neutral: "bg-slate-100 text-slate-600 ring-slate-500/10",
  danger: "bg-rose-50 text-rose-700 ring-rose-600/15",
  outline: "bg-transparent text-foreground ring-border",
};

export function Badge({ className, variant = "default", ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset", styles[variant], className)}
      {...props}
    />
  );
}

