"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Syringe } from "lucide-react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { addVaccination } from "@/actions/medical";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { vaccinationSchema, type VaccinationInput } from "@/lib/validations";

export function VaccinationForm({ petId }: { petId: string }) {
  const [pending, startTransition] = useTransition();
  const form = useForm<VaccinationInput>({
    resolver: zodResolver(vaccinationSchema),
    defaultValues: {
      petId,
      vaccine: "",
      date: new Date().toISOString().slice(0, 10),
      nextDose: "",
    },
  });

  function onSubmit(values: VaccinationInput) {
    startTransition(async () => {
      const result = await addVaccination(values);
      if (result.ok) {
        toast.success("Vaccination added");
        form.reset({ petId, vaccine: "", date: new Date().toISOString().slice(0, 10), nextDose: "" });
      } else {
        toast.error(result.error ?? "Could not add vaccination");
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-4">
      <input type="hidden" {...form.register("petId")} />
      <Field label="Vaccine" error={form.formState.errors.vaccine?.message}>
        <Input autoFocus {...form.register("vaccine")} />
      </Field>
      <Field label="Date" error={form.formState.errors.date?.message}>
        <Input type="date" {...form.register("date")} />
      </Field>
      <Field label="Next dose" error={form.formState.errors.nextDose?.message}>
        <Input type="date" {...form.register("nextDose")} />
      </Field>
      <div className="flex items-end">
        <Button type="submit" disabled={pending} className="w-full">
          <Syringe className="h-4 w-4" />
          {pending ? "Adding..." : "Add"}
        </Button>
      </div>
    </form>
  );
}
