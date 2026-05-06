"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, PawPrint } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createPet, updatePet } from "@/actions/pets";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { petSchema, type PetInput } from "@/lib/validations";

type ClientOption = { id: string; name: string };

export function PetFormModal({
  clients,
  pet,
  trigger,
}: {
  clients: ClientOption[];
  pet?: PetInput;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const form = useForm<PetInput>({
    resolver: zodResolver(petSchema),
    defaultValues: pet ?? {
      name: "",
      species: "",
      breed: "",
      sex: "Female",
      birthDate: "",
      photoUrl: "",
      clientId: clients[0]?.id ?? "",
    },
  });

  function onSubmit(values: PetInput) {
    startTransition(async () => {
      const result = pet?.id ? await updatePet({ ...values, id: pet.id }) : await createPet(values);
      if (result.ok) {
        toast.success(pet?.id ? "Mascota actualizada" : "Mascota agregada");
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
          <Button type="button" disabled={clients.length === 0} className="bg-black hover:bg-black/90">
            <Plus className="h-4 w-4" />
            Agregar Mascota
          </Button>
        )}
      </span>
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl">
            <div className="mb-5 flex items-center gap-3">
              <span className="rounded-2xl bg-lemon-chiffon p-3 text-black">
                <PawPrint className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold">{pet?.id ? "Editar mascota" : "Nueva mascota"}</h2>
                <p className="text-sm text-black/60">Identidad clínica y enlace con propietario.</p>
              </div>
            </div>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombre" error={form.formState.errors.name?.message}>
                <Input autoFocus {...form.register("name")} />
              </Field>
              <Field label="Propietario" error={form.formState.errors.clientId?.message}>
                <Select {...form.register("clientId")}>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Especie" error={form.formState.errors.species?.message}>
                <Input placeholder="Perro, gato..." {...form.register("species")} />
              </Field>
              <Field label="Raza" error={form.formState.errors.breed?.message}>
                <Input {...form.register("breed")} />
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
              <Field label="Peso kg" error={form.formState.errors.weight?.message}>
                <Input type="number" step="0.1" {...form.register("weight")} />
              </Field>
              <Field label="URL de foto" error={form.formState.errors.photoUrl?.message}>
                <Input {...form.register("photoUrl")} />
              </Field>
              <div className="flex justify-end gap-3 sm:col-span-2">
                <Button type="button" variant="secondary" onClick={() => setOpen(false)} className="hover:bg-black/10">
                  Cancelar
                </Button>
                <Button type="submit" disabled={pending} className="bg-black hover:bg-black/90">
                  {pending ? "Guardando..." : "Guardar mascota"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
