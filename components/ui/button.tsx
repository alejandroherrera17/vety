import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
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
          "bg-primary text-primary-foreground shadow-sm shadow-black/10 hover:-translate-y-0.5 hover:brightness-110",
        variant === "secondary" &&
          "border border-border bg-secondary text-secondary-foreground shadow-sm shadow-black/10 hover:-translate-y-0.5 hover:bg-accent hover:text-accent-foreground",
        variant === "outline" &&
          "border border-border bg-transparent text-foreground shadow-sm shadow-black/10 hover:-translate-y-0.5 hover:bg-accent hover:text-accent-foreground",
        variant === "ghost" && "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
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
