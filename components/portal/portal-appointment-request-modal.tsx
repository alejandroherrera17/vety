"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar as CalendarIcon, Clock, PawPrint, FileText } from "lucide-react";
import { toast } from "sonner";
import { createAppointmentRequest } from "@/app/actions/portal";
import { Button } from "@/components/ui/button";
import { FormModalShell } from "@/components/ui/form-modal-shell";
import { Field, Select, Input, Textarea } from "@/components/ui/input";
import { z } from "zod";

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
        toast.success("Solicitud enviada a la clínica");
        setOpen(false);
        form.reset();
      } else {
        toast.error(result.error ?? "No se pudo enviar la solicitud");
      }
    });
  }

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 px-8 py-6 text-lg"
      >
        <CalendarIcon className="mr-2 h-5 w-5" />
        Solicitar Cita
      </Button>

      {open && (
        <FormModalShell
          title={`Solicitar cita en ${clinicName}`}
          description="Tu solicitud será enviada a la clínica para ser confirmada."
          icon={<CalendarIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
          onClose={() => setOpen(false)}
        >
          {pets.length === 0 ? (
            <div className="py-8 text-center space-y-4">
              <PawPrint className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-900 dark:text-white font-medium">No tienes mascotas registradas</p>
              <p className="text-sm text-slate-500">Debes registrar al menos una mascota en tu perfil para poder agendar una cita.</p>
              <Button onClick={() => setOpen(false)} className="mt-4 bg-emerald-600 hover:bg-emerald-700">Entendido</Button>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <Field label="¿Para cuál mascota es la cita?" error={form.formState.errors.petId?.message}>
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
                  <option value="Vacunación">Vacunación</option>
                  <option value="Desparasitación">Desparasitación</option>
                  <option value="Control">Control</option>
                  <option value="Urgencia">Urgencia</option>
                  <option value="Peluquería / Baño">Peluquería / Baño</option>
                  <option value="Otro">Otro</option>
                </Select>
              </Field>

              {veterinarians.length > 0 && (
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
              )}

              <Field label="Fecha y hora preferida" error={form.formState.errors.requestedStart?.message}>
                <div className="relative">
                  <Input type="datetime-local" {...form.register("requestedStart")} className="pl-10" />
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </Field>

              <Field label="Motivo o notas adicionales (opcional)" error={form.formState.errors.reason?.message}>
                <Textarea 
                  {...form.register("reason")} 
                  placeholder="Describe brevemente los síntomas o motivo de la visita..."
                  rows={3}
                />
              </Field>

              <div className="pt-4 border-t border-slate-100 dark:border-border flex justify-end gap-3 mt-6">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={pending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  {pending ? "Enviando..." : "Enviar Solicitud"}
                </Button>
              </div>
            </form>
          )}
        </FormModalShell>
      )}
    </>
  );
}
