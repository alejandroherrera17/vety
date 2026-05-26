"use client";

import { Building2, ImageUp, Save } from "lucide-react";
import { useState, useTransition } from "react";
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
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const form = useForm<OrganizationProfileValues>({ defaultValues: initialValues });
  const logoUrl = form.watch("logoUrl");

  async function uploadLogo(file: File) {
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("purpose", "clinic-logo");
      formData.append("file", file);

      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const body = (await response.json()) as { fileUrl: string };
      form.setValue("logoUrl", body.fileUrl, { shouldDirty: true });
      toast.success("Logo actualizado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo subir el logo");
    } finally {
      setUploadingLogo(false);
    }
  }

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
        <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-lg border border-border bg-white text-[#147fba]">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Logo de la clinica" className="h-full w-full object-cover" />
          ) : (
            <Building2 className="h-5 w-5" />
          )}
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
        <div className="grid gap-2">
          <Field label="Logo de la clinica" error={form.formState.errors.logoUrl?.message}>
            <Input {...form.register("logoUrl")} placeholder="https://... o sube una imagen" />
          </Field>
          <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#27ADF5]/30 bg-[#27ADF5]/10 px-3 text-sm font-semibold text-foreground transition hover:bg-[#27ADF5]/18">
            <ImageUp className="h-4 w-4" />
            {uploadingLogo ? "Subiendo..." : "Subir logo"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={uploadingLogo}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void uploadLogo(file);
                event.currentTarget.value = "";
              }}
            />
          </label>
        </div>
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
