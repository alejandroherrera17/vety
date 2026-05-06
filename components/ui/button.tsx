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
        "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500",
        variant === "primary" &&
          "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700",
        variant === "secondary" &&
          "border border-slate-200 bg-white text-slate-800 shadow-sm hover:bg-slate-50",
        variant === "ghost" && "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
        variant === "danger" && "bg-rose-600 text-white shadow-sm hover:bg-rose-700",
        size === "sm" && "h-9 px-3",
        size === "md" && "h-11 px-4",
        size === "icon" && "h-10 w-10",
        className,
      )}
      {...props}
    />
  );
}
