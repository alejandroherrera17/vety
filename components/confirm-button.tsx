"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/actions/clients";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ConfirmButton({
  id,
  label = "Eliminar",
  action,
  onDone,
  className,
}: {
  id: string;
  label?: string;
  action: (input: { id: string }) => Promise<ActionResult>;
  onDone?: () => void;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="danger"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!window.confirm("Eliminar este registro? Esto no se puede deshacer.")) return;
        startTransition(async () => {
          const result = await action({ id });
          if (result.ok) {
            toast.success("Eliminado");
            onDone?.();
          } else {
            toast.error(result.error ?? "No se pudo eliminar");
          }
        });
      }}
      className={cn(className)}
    >
      <Trash2 className="h-4 w-4" />
      {pending ? "Eliminando..." : label}
    </Button>
  );
}
