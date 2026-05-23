"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarPlus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createAppointment, deleteAppointment, updateAppointment } from "@/actions/appointments";
import { Button } from "@/components/ui/button";
import { FormModalShell } from "@/components/ui/form-modal-shell";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { appointmentSchema, type AppointmentInput } from "@/lib/validations";

export type AppointmentPetOption = {
  id: string;
  name: string;
  owner: string;
};

export type AppointmentVeterinarianOption = {
  id: string;
  name: string;
  role: string;
};

export type AppointmentFormValue = AppointmentInput & {
  id?: string;
};

const statusLabels = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  in_progress: "En progreso",
  cancelled: "Cancelada",
  completed: "Completada",
  no_show: "No asistio",
};

function toLocalInputValue(value: Date | string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function defaultEndDate(startDate: string) {
  const start = new Date(startDate);
  start.setMinutes(start.getMinutes() + 30);
  return toLocalInputValue(start);
}

export function AppointmentModal({
  pets,
  veterinarians = [],
  appointment,
  startDate,
  trigger,
  openOnMount = false,
}: {
  pets: AppointmentPetOption[];
  veterinarians?: AppointmentVeterinarianOption[];
  appointment?: AppointmentFormValue;
  startDate?: string;
  trigger?: ReactNode;
  openOnMount?: boolean;
}) {
  const [open, setOpen] = useState(openOnMount);
  const [pending, startTransition] = useTransition();
  const initialStart = appointment?.startDate ?? startDate ?? toLocalInputValue(new Date());
  const form = useForm<AppointmentInput>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: appointment ?? {
      petId: pets[0]?.id ?? "",
      assignedVeterinarianId: veterinarians[0]?.id ?? "",
      title: "",
      notes: "",
      startDate: initialStart,
      endDate: defaultEndDate(initialStart),
      status: "pending",
    },
  });

  useEffect(() => {
    if (!open) return;
    const nextStart = appointment?.startDate ?? startDate ?? toLocalInputValue(new Date());
    form.reset(
      appointment ?? {
        petId: pets[0]?.id ?? "",
        assignedVeterinarianId: veterinarians[0]?.id ?? "",
        title: "",
        notes: "",
        startDate: nextStart,
        endDate: defaultEndDate(nextStart),
        status: "pending",
      },
    );
  }, [appointment, form, open, pets, startDate, veterinarians]);

  function onSubmit(values: AppointmentInput) {
    startTransition(async () => {
      const result = appointment?.id
        ? await updateAppointment({ ...values, id: appointment.id })
        : await createAppointment(values);

      if (result.ok) {
        toast.success(appointment?.id ? "Cita actualizada" : "Cita creada");
        setOpen(false);
      } else {
        toast.error(result.error ?? "No se pudo guardar la cita");
      }
    });
  }

  function onDelete() {
    if (!appointment?.id) return;
    startTransition(async () => {
      const result = await deleteAppointment({ id: appointment.id });
      if (result.ok) {
        toast.success("Cita eliminada");
        setOpen(false);
      } else {
        toast.error(result.error ?? "No se pudo eliminar la cita");
      }
    });
  }

  return (
    <>
      <span onClick={() => setOpen(true)}>
        {trigger ?? (
          <Button type="button">
            <CalendarPlus className="h-4 w-4" />
            Nueva cita
          </Button>
        )}
      </span>
      {open ? (
        <FormModalShell
          title={appointment?.id ? "Editar cita" : "Nueva cita"}
          description="Agenda clinica con propietario, paciente y estado."
          icon={<CalendarPlus className="h-5 w-5" />}
          onClose={() => setOpen(false)}
        >
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
            <Field label="Mascota" error={form.formState.errors.petId?.message}>
              <Select {...form.register("petId")}>
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name} - {pet.owner}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Estado" error={form.formState.errors.status?.message}>
              <Select {...form.register("status")}>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Veterinario asignado" error={form.formState.errors.assignedVeterinarianId?.message}>
              <Select {...form.register("assignedVeterinarianId")}>
                {veterinarians.map((veterinarian) => (
                  <option key={veterinarian.id} value={veterinarian.id}>
                    {veterinarian.name} - {veterinarian.role}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Titulo" error={form.formState.errors.title?.message}>
                <Input placeholder="Consulta general, control postoperatorio..." {...form.register("title")} />
              </Field>
            </div>
            <Field label="Inicio" error={form.formState.errors.startDate?.message}>
              <Input type="datetime-local" {...form.register("startDate")} />
            </Field>
            <Field label="Fin" error={form.formState.errors.endDate?.message}>
              <Input type="datetime-local" {...form.register("endDate")} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Notas" error={form.formState.errors.notes?.message}>
                <Textarea
                  className="min-h-24"
                  placeholder="Indicaciones internas, motivo o detalles de la cita"
                  {...form.register("notes")}
                />
              </Field>
            </div>
            <div className="flex flex-col-reverse justify-between gap-3 sm:col-span-2 sm:flex-row">
              {appointment?.id ? (
                <Button type="button" variant="danger" onClick={onDelete} disabled={pending}>
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </Button>
              ) : (
                <span />
              )}
              <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button disabled={pending} type="submit">
                  {pending ? "Guardando..." : "Guardar cita"}
                </Button>
              </div>
            </div>
          </form>
        </FormModalShell>
      ) : null}
    </>
  );
}
