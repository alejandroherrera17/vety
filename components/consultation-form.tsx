"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mic, Save, Sparkles } from "lucide-react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createConsultation } from "@/actions/medical";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { commonSymptoms } from "@/lib/clinical";
import { consultationSchema, type ConsultationInput } from "@/lib/validations";

function defaultValues(petId: string): ConsultationInput {
  return {
    petId,
    date: new Date().toISOString().slice(0, 16),
    reason: "",
    anamnesis: "",
    symptoms: "",
    commonSymptoms: [],
    temperature: undefined,
    heartRate: undefined,
    respiratoryRate: undefined,
    weight: undefined,
    physicalExam: "",
    presumptiveDiagnosis: "",
    diagnosis: "",
    definitiveDiagnosis: "",
    treatment: "",
    recommendations: "",
    evolution: "",
    observations: "",
    status: "open",
    templateName: "",
  };
}

export function ConsultationForm({ petId }: { petId: string }) {
  const [pending, startTransition] = useTransition();
  const form = useForm<ConsultationInput>({
    resolver: zodResolver(consultationSchema),
    defaultValues: defaultValues(petId),
  });

  function onSubmit(values: ConsultationInput) {
    startTransition(async () => {
      const result = await createConsultation(values);
      if (result.ok) {
        toast.success("Consulta guardada");
        form.reset(defaultValues(petId));
      } else {
        toast.error(result.error ?? "No se pudo guardar la consulta");
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
      <input type="hidden" {...form.register("petId")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Fecha" error={form.formState.errors.date?.message}>
          <Input type="datetime-local" {...form.register("date")} />
        </Field>
        <Field label="Estado" error={form.formState.errors.status?.message}>
          <Select {...form.register("status")}>
            <option value="open">Abierto</option>
            <option value="stable">Estable</option>
            <option value="critical">Critico</option>
            <option value="closed">Cerrado</option>
            <option value="scheduled">Programado</option>
          </Select>
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Motivo de consulta" error={form.formState.errors.reason?.message}>
          <Input placeholder="Control, urgencia, seguimiento..." {...form.register("reason")} />
        </Field>
        <Field label="Plantilla" error={form.formState.errors.templateName?.message}>
          <Select {...form.register("templateName")}>
            <option value="">Sin plantilla</option>
            <option value="consulta-general">Consulta general</option>
            <option value="dermatologia">Dermatologia</option>
            <option value="gastrointestinal">Gastrointestinal</option>
            <option value="control-postoperatorio">Control postoperatorio</option>
          </Select>
        </Field>
      </div>
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-zinc-800">Sintomas comunes</p>
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs font-semibold text-zinc-500 ring-1 ring-zinc-200">
            <Sparkles className="h-3 w-3" />
            IA ready
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {commonSymptoms.map((symptom) => (
            <label key={symptom} className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-zinc-600 ring-1 ring-zinc-200 transition hover:bg-zinc-100">
              <input type="checkbox" value={symptom} {...form.register("commonSymptoms")} className="h-3 w-3 accent-black" />
              {symptom}
            </label>
          ))}
        </div>
      </div>
      <Field label="Anamnesis" error={form.formState.errors.anamnesis?.message}>
        <Textarea placeholder="Historia, apetito, consumo de agua, ambiente, medicaciones previas..." className="min-h-28 text-base" {...form.register("anamnesis")} />
      </Field>
      <Field label="Sintomas" error={form.formState.errors.symptoms?.message}>
        <Textarea autoFocus placeholder="Signos clinicos, duracion, apetito, comportamiento..." className="min-h-40 text-base" {...form.register("symptoms")} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-4">
        <Field label="Temperatura C" error={form.formState.errors.temperature?.message}>
          <Input type="number" step="0.1" {...form.register("temperature")} />
        </Field>
        <Field label="FC lpm" error={form.formState.errors.heartRate?.message}>
          <Input type="number" {...form.register("heartRate")} />
        </Field>
        <Field label="FR rpm" error={form.formState.errors.respiratoryRate?.message}>
          <Input type="number" {...form.register("respiratoryRate")} />
        </Field>
        <Field label="Peso kg" error={form.formState.errors.weight?.message}>
          <Input type="number" step="0.1" {...form.register("weight")} />
        </Field>
      </div>
      <Field label="Examen fisico" error={form.formState.errors.physicalExam?.message}>
        <Textarea className="min-h-32 text-base" {...form.register("physicalExam")} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Diagnostico presuntivo" error={form.formState.errors.presumptiveDiagnosis?.message}>
          <Textarea className="min-h-28 text-base" {...form.register("presumptiveDiagnosis")} />
        </Field>
        <Field label="Diagnostico definitivo" error={form.formState.errors.definitiveDiagnosis?.message}>
          <Textarea className="min-h-28 text-base" {...form.register("definitiveDiagnosis")} />
        </Field>
      </div>
      <Field label="Diagnostico principal" error={form.formState.errors.diagnosis?.message}>
        <Textarea className="min-h-28 text-base" {...form.register("diagnosis")} />
      </Field>
      <Field label="Tratamiento" error={form.formState.errors.treatment?.message}>
        <Textarea className="min-h-36 text-base" {...form.register("treatment")} />
      </Field>
      <Field label="Recomendaciones" error={form.formState.errors.recommendations?.message}>
        <Textarea className="min-h-24" {...form.register("recommendations")} />
      </Field>
      <Field label="Evolucion" error={form.formState.errors.evolution?.message}>
        <Textarea className="min-h-24" {...form.register("evolution")} />
      </Field>
      <Field label="Observaciones" error={form.formState.errors.observations?.message}>
        <Textarea className="min-h-24" {...form.register("observations")} />
      </Field>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" variant="secondary" className="w-full sm:w-fit">
          <Mic className="h-4 w-4" />
          Dictado preparado
        </Button>
        <Button type="submit" disabled={pending} className="w-full sm:w-fit">
          <Save className="h-4 w-4" />
          {pending ? "Autoguardando..." : "Guardar consulta"}
        </Button>
      </div>
    </form>
  );
}
