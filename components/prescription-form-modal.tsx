"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pill, Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createPrescription } from "@/actions/prescriptions";
import { Button } from "@/components/ui/button";
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
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl">
            <div className="mb-5 flex items-center gap-3">
              <span className="rounded-2xl bg-black/10 p-3 text-black">
                <Pill className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-black">Nueva formula medica</h2>
                <p className="text-sm text-black/60">Medicamento, dosis, duracion e indicaciones.</p>
              </div>
            </div>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <input type="hidden" {...form.register("consultationId")} />
              <Field label="Medicamento" error={form.formState.errors.medication?.message}>
                <Input autoFocus {...form.register("medication")} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Dosis" error={form.formState.errors.dosage?.message}>
                  <Input {...form.register("dosage")} />
                </Field>
                <Field label="Duracion" error={form.formState.errors.duration?.message}>
                  <Input {...form.register("duration")} />
                </Field>
              </div>
              <Field label="Indicaciones" error={form.formState.errors.instructions?.message}>
                <Textarea className="min-h-28" {...form.register("instructions")} />
              </Field>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? "Guardando..." : "Guardar formula"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
