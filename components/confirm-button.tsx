"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/actions/clients";

export function ConfirmButton({
  id,
  label = "Delete",
  action,
  onDone,
}: {
  id: string;
  label?: string;
  action: (input: { id: string }) => Promise<ActionResult>;
  onDone?: () => void;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="danger"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(`Delete this record? This cannot be undone.`)) return;
        startTransition(async () => {
          const result = await action({ id });
          if (result.ok) {
            toast.success("Deleted");
            onDone?.();
          } else {
            toast.error(result.error ?? "Could not delete");
          }
        });
      }}
    >
      <Trash2 className="h-4 w-4" />
      {pending ? "Deleting..." : label}
    </Button>
  );
}
