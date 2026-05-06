"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createConsultation } from "@/actions/medical";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { consultationSchema, type ConsultationInput } from "@/lib/validations";

export function ConsultationForm({ petId }: { petId: string }) {
  const [pending, startTransition] = useTransition();
  const form = useForm<ConsultationInput>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      petId,
      date: new Date().toISOString().slice(0, 16),
      symptoms: "",
      diagnosis: "",
      treatment: "",
      observations: "",
    },
  });

  function onSubmit(values: ConsultationInput) {
    startTransition(async () => {
      const result = await createConsultation(values);
      if (result.ok) {
        toast.success("Consulta guardada");
        form.reset({
          petId,
          date: new Date().toISOString().slice(0, 16),
          symptoms: "",
          diagnosis: "",
          treatment: "",
          observations: "",
        });
      } else {
        toast.error(result.error ?? "No se pudo guardar la consulta");
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
      <input type="hidden" {...form.register("petId")} />
      <Field label="Fecha" error={form.formState.errors.date?.message}>
        <Input type="datetime-local" {...form.register("date")} />
      </Field>
      <Field label="Síntomas" error={form.formState.errors.symptoms?.message}>
        <Textarea
          autoFocus
          placeholder="Signos clínicos, duración, apetito, comportamiento..."
          className="min-h-40 text-base"
          {...form.register("symptoms")}
        />
      </Field>
      <Field label="Diagnóstico" error={form.formState.errors.diagnosis?.message}>
        <Textarea className="min-h-36 text-base" {...form.register("diagnosis")} />
      </Field>
      <Field label="Tratamiento" error={form.formState.errors.treatment?.message}>
        <Textarea className="min-h-36 text-base" {...form.register("treatment")} />
      </Field>
      <Field label="Observaciones" error={form.formState.errors.observations?.message}>
        <Textarea className="min-h-24" {...form.register("observations")} />
      </Field>
      <Button type="submit" disabled={pending} className="w-full bg-black hover:bg-black/90 sm:w-fit">
        <Save className="h-4 w-4" />
        {pending ? "Guardando..." : "Guardar consulta"}
      </Button>
    </form>
  );
}
