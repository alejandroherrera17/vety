import * as React from "react";
import { cn } from "@/lib/utils";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-11 w-full rounded-lg border border-border/80 bg-white px-3 text-sm text-foreground shadow-sm shadow-sky-950/5 outline-none transition-all placeholder:text-muted-foreground/70 hover:border-primary/45 focus:border-primary/70 focus:ring-4 focus:ring-primary/15",
        props.className,
      )}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-32 w-full rounded-lg border border-border/80 bg-white px-3 py-3 text-sm text-foreground shadow-sm shadow-sky-950/5 outline-none transition-all placeholder:text-muted-foreground/70 hover:border-primary/45 focus:border-primary/70 focus:ring-4 focus:ring-primary/15",
        props.className,
      )}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "h-11 w-full rounded-lg border border-border/80 bg-white px-3 text-sm text-foreground shadow-sm shadow-sky-950/5 outline-none transition-all hover:border-primary/45 focus:border-primary/70 focus:ring-4 focus:ring-primary/15",
        props.className,
      )}
    />
  );
}

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-foreground">
      <span>{label}</span>
      {children}
      {error ? <span className="text-xs font-medium text-destructive">{error}</span> : null}
    </label>
  );
}
