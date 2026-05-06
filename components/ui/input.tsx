import * as React from "react";
import { cn } from "@/lib/utils";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-11 w-full rounded-xl border border-black/15 bg-white px-3 text-sm text-black shadow-sm outline-none transition placeholder:text-black/40 focus:border-black focus:ring-4 focus:ring-black/10",
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
        "min-h-32 w-full rounded-xl border border-black/15 bg-white px-3 py-3 text-sm text-black shadow-sm outline-none transition placeholder:text-black/40 focus:border-black focus:ring-4 focus:ring-black/10",
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
        "h-11 w-full rounded-xl border border-black/15 bg-white px-3 text-sm text-black shadow-sm outline-none transition focus:border-black focus:ring-4 focus:ring-black/10",
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
    <label className="grid gap-2 text-sm font-medium text-black">
      <span>{label}</span>
      {children}
      {error ? <span className="text-xs font-medium text-black">{error}</span> : null}
    </label>
  );
}
