import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "icon";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        variant === "primary" &&
          "bg-gradient-to-r from-cyan-300 via-sky-400 to-emerald-300 text-slate-950 shadow-[0_14px_38px_rgba(34,211,238,0.20)] hover:-translate-y-0.5 hover:shadow-[0_18px_48px_rgba(34,211,238,0.28)]",
        variant === "secondary" &&
          "border border-white/12 bg-white/[0.07] text-foreground shadow-sm shadow-black/10 backdrop-blur hover:-translate-y-0.5 hover:border-cyan-200/35 hover:bg-white/[0.11]",
        variant === "ghost" && "text-muted-foreground hover:bg-white/[0.08] hover:text-foreground",
        variant === "danger" && "bg-destructive text-destructive-foreground shadow-sm hover:-translate-y-0.5 hover:brightness-110",
        size === "sm" && "h-9 px-3",
        size === "md" && "h-11 px-4",
        size === "icon" && "h-10 w-10",
        className,
      )}
      {...props}
    />
  );
}
