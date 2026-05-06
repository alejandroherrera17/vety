import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl border border-black/15 bg-white p-5 shadow-sm", className)}
      {...props}
    />
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-black/30 bg-white p-8 text-center">
      <h3 className="text-base font-semibold text-black">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-black/60">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
