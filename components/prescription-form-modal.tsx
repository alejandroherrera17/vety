"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pill, Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createPrescription } from "@/actions/prescriptions";
import { Button } from "@/components/ui/button";
import { FormModalShell } from "@/components/ui/form-modal-shell";
import { Field, Input, Textarea } from "@/components/ui/input";
import { prescriptionSchema, type PrescriptionInput } from "@/lib/validations";

export function PrescriptionFormModal({ consultationId }: { consultationId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const form = useForm<PrescriptionInput>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      consultationId,
      medication: "",
      dosage: "",
      duration: "",
      instructions: "",
    },
  });

  function onSubmit(values: PrescriptionInput) {
    startTransition(async () => {
      const result = await createPrescription(values);
      if (result.ok) {
        toast.success("Formula creada");
        setOpen(false);
        form.reset({ consultationId, medication: "", dosage: "", duration: "", instructions: "" });
      } else {
        toast.error(result.error ?? "No se pudo crear la formula");
      }
    });
  }

  return (
    <>
      <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Formula
      </Button>
      {open ? (
        <FormModalShell
          title="Nueva formula medica"
          description="Medicamento, dosis, duracion e indicaciones."
          icon={<Pill className="h-5 w-5" />}
          onClose={() => setOpen(false)}
          className="max-w-xl"
        >
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <input type="hidden" {...form.register("consultationId")} />
            <Field label="Medicamento" error={form.formState.errors.medication?.message}>
              <Input autoFocus placeholder="Nombre del medicamento" {...form.register("medication")} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Dosis" error={form.formState.errors.dosage?.message}>
                <Input placeholder="Ej. 1 tableta cada 12 h" {...form.register("dosage")} />
              </Field>
              <Field label="Duracion" error={form.formState.errors.duration?.message}>
                <Input placeholder="Ej. 7 dias" {...form.register("duration")} />
              </Field>
            </div>
            <Field label="Indicaciones" error={form.formState.errors.instructions?.message}>
              <Textarea
                className="min-h-28"
                placeholder="Indicaciones para el propietario"
                {...form.register("instructions")}
              />
            </Field>
            <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Guardando..." : "Guardar formula"}
              </Button>
            </div>
          </form>
        </FormModalShell>
      ) : null}
    </>
  );
}
