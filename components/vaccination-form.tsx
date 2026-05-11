"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Syringe } from "lucide-react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { addVaccination } from "@/actions/medical";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { vaccinationSchema, type VaccinationInput } from "@/lib/validations";

function defaults(petId: string): VaccinationInput {
  return {
    petId,
    vaccine: "",
    date: new Date().toISOString().slice(0, 10),
    nextDose: "",
    lot: "",
    manufacturer: "",
    expiresAt: "",
    veterinarianName: "",
    status: "closed",
    notes: "",
  };
}

export function VaccinationForm({ petId }: { petId: string }) {
  const [pending, startTransition] = useTransition();
  const form = useForm<VaccinationInput>({
    resolver: zodResolver(vaccinationSchema),
    defaultValues: defaults(petId),
  });

  function onSubmit(values: VaccinationInput) {
    startTransition(async () => {
      const result = await addVaccination(values);
      if (result.ok) {
        toast.success("Vacunacion agregada");
        form.reset(defaults(petId));
      } else {
        toast.error(result.error ?? "No se pudo agregar la vacunacion");
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
      <input type="hidden" {...form.register("petId")} />
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Vacuna" error={form.formState.errors.vaccine?.message}>
          <Input autoFocus {...form.register("vaccine")} />
        </Field>
        <Field label="Fecha aplicada" error={form.formState.errors.date?.message}>
          <Input type="date" {...form.register("date")} />
        </Field>
        <Field label="Proxima dosis" error={form.formState.errors.nextDose?.message}>
          <Input type="date" {...form.register("nextDose")} />
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Lote" error={form.formState.errors.lot?.message}>
          <Input {...form.register("lot")} />
        </Field>
        <Field label="Fabricante" error={form.formState.errors.manufacturer?.message}>
          <Input {...form.register("manufacturer")} />
        </Field>
        <Field label="Vencimiento" error={form.formState.errors.expiresAt?.message}>
          <Input type="date" {...form.register("expiresAt")} />
        </Field>
        <Field label="Estado" error={form.formState.errors.status?.message}>
          <Select {...form.register("status")}>
            <option value="closed">Aplicada</option>
            <option value="scheduled">Programada</option>
            <option value="open">Pendiente</option>
          </Select>
        </Field>
      </div>
      <Field label="Veterinario responsable" error={form.formState.errors.veterinarianName?.message}>
        <Input {...form.register("veterinarianName")} />
      </Field>
      <Field label="Notas" error={form.formState.errors.notes?.message}>
        <Textarea className="min-h-20" {...form.register("notes")} />
      </Field>
      <Button type="submit" disabled={pending} className="w-full sm:w-fit">
        <Syringe className="h-4 w-4" />
        {pending ? "Agregando..." : "Agregar vacuna"}
      </Button>
    </form>
  );
}
