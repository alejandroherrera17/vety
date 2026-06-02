"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar as CalendarIcon, Clock, PawPrint, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { createAppointmentRequest } from "@/app/actions/portal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/input";

const requestSchema = z
  .object({
    petId: z.string().min(1, "Selecciona una mascota"),
    service: z.string().min(2, "Selecciona o escribe un servicio"),
    reason: z.string().optional(),
    requestedVeterinarianId: z.string().optional(),
    requestedStart: z.string().min(1, "Selecciona fecha y hora preferida"),
  })
  .refine((value) => !value.requestedStart || !Number.isNaN(Date.parse(value.requestedStart)), {
    message: "Selecciona una fecha valida",
    path: ["requestedStart"],
  });

type RequestInput = z.infer<typeof requestSchema>;

export function PortalClinicRequestForm({
  clinicId,
  clinicName,
  pets,
  veterinarians,
}: {
  clinicId: string;
  clinicName: string;
  pets: { id: string; name: string; species: string }[];
  veterinarians: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState<string | null>(null);

  const form = useForm<RequestInput>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      petId: pets.length === 1 ? pets[0].id : "",
      service: "",
      reason: "",
      requestedVeterinarianId: "",
      requestedStart: "",
    },
  });

  function onSubmit(values: RequestInput) {
    startTransition(async () => {
      const result = await createAppointmentRequest({
        ...values,
        organizationId: clinicId,
      });

      if (!result.ok) {
        toast.error(result.error ?? "No se pudo enviar la solicitud");
        return;
      }

      const requestId =
        typeof result.data === "object" && result.data && "id" in result.data ? String(result.data.id) : null;

      setSubmitted(requestId);
      toast.success("Solicitud enviada", {
        description: "La clinica ya la tiene en su bandeja para revisar.",
      });
      form.reset({
        petId: values.petId,
        service: "",
        reason: "",
        requestedVeterinarianId: "",
        requestedStart: "",
      });
      router.push("/portal/requests?submitted=1");
    });
  }

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-sky-200/20 bg-sky-300/10 text-[#27ADF5]">
          <CalendarIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#27ADF5]">Solicitar cita</p>
          <h2 className="text-2xl font-bold text-foreground">Pide una cita en {clinicName}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Completa estos datos y la clinica la recibira como solicitud pendiente. Primero revisan y luego confirman.
          </p>
        </div>
      </div>

      {pets.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-border bg-secondary p-5 text-sm text-muted-foreground">
          <PawPrint className="mb-3 h-10 w-10 text-[#27ADF5]" />
          <p className="font-semibold text-foreground">No tienes mascotas registradas</p>
          <p className="mt-1">Necesitas crear al menos una mascota en tu perfil para solicitar una cita.</p>
        </div>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 grid gap-4">
          <Field label="Mascota" error={form.formState.errors.petId?.message}>
            <Select {...form.register("petId")}>
              <option value="">Selecciona una mascota</option>
              {pets.map((pet) => (
                <option key={pet.id} value={pet.id}>
                  {pet.name} ({pet.species})
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Servicio" error={form.formState.errors.service?.message}>
            <Select {...form.register("service")}>
              <option value="">Selecciona un servicio</option>
              <option value="Consulta General">Consulta General</option>
              <option value="Vacunacion">Vacunacion</option>
              <option value="Desparasitacion">Desparasitacion</option>
              <option value="Control">Control</option>
              <option value="Urgencia">Urgencia</option>
              <option value="Peluqueria / Bano">Peluqueria / Bano</option>
              <option value="Otro">Otro</option>
            </Select>
          </Field>

          {veterinarians.length > 0 ? (
            <Field label="Veterinario preferido (opcional)" error={form.formState.errors.requestedVeterinarianId?.message}>
              <Select {...form.register("requestedVeterinarianId")}>
                <option value="">Cualquiera disponible</option>
                {veterinarians.map((vet) => (
                  <option key={vet.id} value={vet.id}>
                    {vet.name}
                  </option>
                ))}
              </Select>
            </Field>
          ) : null}

          <Field label="Fecha y hora preferida" error={form.formState.errors.requestedStart?.message}>
            <div className="relative">
              <Input type="datetime-local" {...form.register("requestedStart")} className="pl-10" />
              <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </Field>

          <Field label="Motivo o notas" error={form.formState.errors.reason?.message}>
            <Textarea
              {...form.register("reason")}
              placeholder="Cuenta a la clinica por que necesitas la cita..."
              rows={4}
            />
          </Field>

          <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              La solicitud quedara registrada y podras seguir su estado en <span className="font-medium text-foreground">Mis solicitudes</span>.
            </p>
            <Button type="submit" disabled={pending} className="w-full bg-[#27ADF5] text-white hover:bg-[#149fe8] sm:w-auto">
              <Sparkles className="h-4 w-4" />
              {pending ? "Enviando..." : "Enviar solicitud"}
            </Button>
          </div>

          {submitted ? (
            <p className="text-xs font-medium text-[#27ADF5]">Solicitud registrada correctamente. Codigo interno: {submitted}</p>
          ) : null}
        </form>
      )}
    </Card>
  );
}
