"use client";

import { X } from "lucide-react";
import type { MouseEvent, ReactNode } from "react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FormModalShell({
  title,
  description,
  icon,
  children,
  onClose,
  className,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
  onClose: () => void;
  className?: string;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (typeof document === "undefined") return null;

  function closeFromBackdrop(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose();
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-black/65 p-3 backdrop-blur-md sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="form-modal-title"
      onMouseDown={closeFromBackdrop}
    >
      <div
        className={cn(
          "my-4 max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-2xl shadow-black/35 ring-1 ring-white/10 sm:p-6",
          className,
        )}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-border bg-secondary text-secondary-foreground">
              {icon}
            </span>
            <div className="min-w-0">
              <h2 id="form-modal-title" className="text-lg font-bold text-popover-foreground">
                {title}
              </h2>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">{description}</p>
            </div>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Cerrar ventana">
            <X className="h-5 w-5" />
          </Button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
