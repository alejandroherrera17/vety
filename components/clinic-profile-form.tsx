"use client";

import { Building2, Save } from "lucide-react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { updateOrganizationProfile } from "@/actions/organization";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/input";
import type { z } from "zod";
import { organizationProfileSchema } from "@/lib/validations";

type OrganizationProfileValues = z.input<typeof organizationProfileSchema>;

export function ClinicProfileForm({
  initialValues,
}: {
  initialValues: OrganizationProfileValues;
}) {
  const [pending, startTransition] = useTransition();
  const form = useForm<OrganizationProfileValues>({ defaultValues: initialValues });

  function onSubmit(values: OrganizationProfileValues) {
    startTransition(async () => {
      const result = await updateOrganizationProfile(values);

      if (result.ok) {
        toast.success("Perfil de clinica actualizado");
      } else {
        toast.error(result.error ?? "No se pudo actualizar la clinica");
      }
    });
  }

  return (
    <Card className="p-5">
      <div className="mb-5 flex items-start gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-lg border border-white/10 bg-white/[0.06] text-emerald-100">
          <Building2 className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-foreground">Perfil publico y operativo</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Estos datos alimentan el workspace interno y el directorio publico para propietarios.
          </p>
        </div>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
        <Field label="Nombre de la clinica" error={form.formState.errors.name?.message}>
          <Input {...form.register("name")} />
        </Field>
        <Field label="Telefono" error={form.formState.errors.phone?.message}>
          <Input {...form.register("phone")} />
        </Field>
        <Field label="Ciudad" error={form.formState.errors.city?.message}>
          <Input {...form.register("city")} />
        </Field>
        <Field label="Logo URL" error={form.formState.errors.logoUrl?.message}>
          <Input {...form.register("logoUrl")} placeholder="https://..." />
        </Field>
        <div className="md:col-span-2">
          <Field label="Direccion" error={form.formState.errors.address?.message}>
            <Input {...form.register("address")} />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Especialidades" error={form.formState.errors.specialties?.message}>
            <Input {...form.register("specialties")} placeholder="Medicina general, vacunacion, urgencias" />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Horarios" error={form.formState.errors.openingHours?.message}>
            <Textarea className="min-h-24" {...form.register("openingHours")} />
          </Field>
        </div>
        <div className="flex justify-end md:col-span-2">
          <Button type="submit" disabled={pending}>
            <Save className="h-4 w-4" />
            {pending ? "Guardando..." : "Guardar clinica"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
