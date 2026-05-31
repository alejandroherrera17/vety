"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar as CalendarIcon, Clock, PawPrint } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { createAppointmentRequest } from "@/app/actions/portal";
import { Button } from "@/components/ui/button";
import { FormModalShell } from "@/components/ui/form-modal-shell";
import { Field, Input, Select, Textarea } from "@/components/ui/input";

const requestSchema = z.object({
  petId: z.string().min(1, "Selecciona una mascota"),
  service: z.string().min(2, "Selecciona o escribe un servicio"),
  reason: z.string().optional(),
  requestedVeterinarianId: z.string().optional(),
  requestedStart: z.string().min(1, "Selecciona fecha y hora preferida"),
});

type RequestInput = z.infer<typeof requestSchema>;

export function PortalAppointmentRequestModal({
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
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

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

      if (result.ok) {
        toast.success("Solicitud enviada a la clinica");
        setOpen(false);
        form.reset();
      } else {
        toast.error(result.error ?? "No se pudo enviar la solicitud");
      }
    });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="w-full bg-[#27ADF5] px-8 py-6 text-lg text-white hover:bg-[#149fe8] md:w-auto">
        <CalendarIcon className="mr-2 h-5 w-5" />
        Solicitar cita
      </Button>

      {open ? (
        <FormModalShell
          title={`Solicitar cita en ${clinicName}`}
          description="Tu solicitud sera enviada a la clinica para ser confirmada."
          icon={<CalendarIcon className="h-5 w-5 text-[#27ADF5]" />}
          onClose={() => setOpen(false)}
        >
          {pets.length === 0 ? (
            <div className="space-y-4 py-8 text-center">
              <PawPrint className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="font-medium text-foreground">No tienes mascotas registradas</p>
              <p className="text-sm text-muted-foreground">
                Debes registrar al menos una mascota en tu perfil para poder agendar una cita.
              </p>
              <Button onClick={() => setOpen(false)} className="mt-4 bg-[#27ADF5] text-white hover:bg-[#149fe8]">
                Entendido
              </Button>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
              <Field label="Para cual mascota es la cita?" error={form.formState.errors.petId?.message}>
                <Select {...form.register("petId")}>
                  <option value="">Seleccionar mascota...</option>
                  {pets.map((pet) => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name} ({pet.species})
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Servicio requerido" error={form.formState.errors.service?.message}>
                <Select {...form.register("service")}>
                  <option value="">Seleccionar servicio...</option>
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
                <Field label="Veterinario de preferencia (opcional)" error={form.formState.errors.requestedVeterinarianId?.message}>
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

              <Field label="Motivo o notas adicionales (opcional)" error={form.formState.errors.reason?.message}>
                <Textarea {...form.register("reason")} placeholder="Describe brevemente los sintomas o motivo de la visita..." rows={3} />
              </Field>

              <div className="mt-6 flex justify-end gap-3 border-t border-border pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={pending} className="bg-[#27ADF5] text-white hover:bg-[#149fe8]">
                  {pending ? "Enviando..." : "Enviar solicitud"}
                </Button>
              </div>
            </form>
          )}
        </FormModalShell>
      ) : null}
    </>
  );
}
