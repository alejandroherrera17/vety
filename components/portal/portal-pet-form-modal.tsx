"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PawPrint, Plus } from "lucide-react";
import type { ReactNode } from "react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createPortalPet } from "@/app/actions/portal";
import { Button } from "@/components/ui/button";
import { FormModalShell } from "@/components/ui/form-modal-shell";
import { Field, Input, Select } from "@/components/ui/input";
import { petSchema, type PetInput } from "@/lib/validations";

export function PortalPetFormModal({
  trigger,
}: {
  trigger?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const form = useForm<PetInput>({
    // We omit clientId validation client-side by passing a dummy value, since the server handles it
    resolver: zodResolver(petSchema),
    defaultValues: {
      name: "",
      species: "",
      breed: "",
      sex: "Hembra",
      birthDate: "",
      photoUrl: "",
      clientId: "00000000-0000-0000-0000-000000000000", // Dummy UUID to pass zod validation
    },
  });

  function onSubmit(values: PetInput) {
    startTransition(async () => {
      const result = await createPortalPet(values);
      if (result.ok) {
        toast.success("Mascota agregada correctamente");
        setOpen(false);
        form.reset();
      } else {
        toast.error(result.error ?? "Revisa el formulario e intenta de nuevo");
      }
    });
  }

  return (
    <>
      <span onClick={() => setOpen(true)}>
        {trigger ?? (
          <Button type="button" className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Añadir mascota
          </Button>
        )}
      </span>
      {open ? (
        <FormModalShell
          title="Añadir Mascota"
          description="Agrega los detalles de tu peludo para solicitar citas."
          icon={<PawPrint className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
          onClose={() => setOpen(false)}
        >
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre" error={form.formState.errors.name?.message}>
              <Input autoFocus placeholder="Nombre de la mascota" {...form.register("name")} />
            </Field>
            <Field label="Especie" error={form.formState.errors.species?.message}>
              <Input placeholder="Perro, gato, etc." {...form.register("species")} />
            </Field>
            <Field label="Raza" error={form.formState.errors.breed?.message}>
              <Input placeholder="Labrador, Siames..." {...form.register("breed")} />
            </Field>
            <Field label="Sexo" error={form.formState.errors.sex?.message}>
              <Select {...form.register("sex")}>
                <option>Hembra</option>
                <option>Macho</option>
                <option>Desconocido</option>
              </Select>
            </Field>
            <Field label="Fecha de nacimiento" error={form.formState.errors.birthDate?.message}>
              <Input type="date" {...form.register("birthDate")} />
            </Field>
            <Field label="Peso (kg)" error={form.formState.errors.weight?.message}>
              <Input type="number" step="0.1" placeholder="4.5" {...form.register("weight")} />
            </Field>
            <Field label="URL de foto (opcional)" error={form.formState.errors.photoUrl?.message}>
              <Input placeholder="https://..." {...form.register("photoUrl")} />
            </Field>
            <div className="flex flex-col-reverse justify-end gap-3 sm:col-span-2 sm:flex-row mt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={pending} className="bg-emerald-600 hover:bg-emerald-700 text-white border-none">
                {pending ? "Guardando..." : "Guardar mascota"}
              </Button>
            </div>
          </form>
        </FormModalShell>
      ) : null}
    </>
  );
}
