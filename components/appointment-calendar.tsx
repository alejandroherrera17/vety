"use client";

import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { updateAppointment } from "@/actions/appointments";
import {
  AppointmentModal,
  type AppointmentFormValue,
  type AppointmentPetOption,
  type AppointmentVeterinarianOption,
} from "@/components/appointment-modal";
import { Input, Select } from "@/components/ui/input";

type AppointmentCalendarItem = {
  id: string;
  title: string;
  notes?: string | null;
  startDate: string;
  endDate: string;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
  petId: string;
  petName: string;
  ownerName: string;
  assignedVeterinarianId?: string | null;
  assignedVeterinarianName?: string | null;
};

const statusColors = {
  pending: "#f59e0b",
  confirmed: "#0d3b66",
  in_progress: "#2563eb",
  cancelled: "#737373",
  completed: "#059669",
  no_show: "#dc2626",
};

export function AppointmentCalendar({
  appointments,
  pets,
  veterinarians,
}: {
  appointments: AppointmentCalendarItem[];
  pets: AppointmentPetOption[];
  veterinarians: AppointmentVeterinarianOption[];
}) {
  const [selected, setSelected] = useState<AppointmentFormValue | undefined>();
  const [selectedStart, setSelectedStart] = useState<string | undefined>();
  const [modalKey, setModalKey] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [veterinarianFilter, setVeterinarianFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [, startTransition] = useTransition();

  const filteredAppointments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return appointments.filter((appointment) => {
      const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;
      const matchesVet =
        veterinarianFilter === "all" ||
        appointment.assignedVeterinarianId === veterinarianFilter;
      const matchesQuery =
        !normalizedQuery ||
        `${appointment.title} ${appointment.petName} ${appointment.ownerName}`
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesStatus && matchesVet && matchesQuery;
    });
  }, [appointments, query, statusFilter, veterinarianFilter]);

  const events = useMemo(
    () =>
      filteredAppointments.map((appointment) => ({
        id: appointment.id,
        title: `${appointment.title} - ${appointment.petName}`,
        start: appointment.startDate,
        end: appointment.endDate,
        backgroundColor: statusColors[appointment.status],
        borderColor: statusColors[appointment.status],
        extendedProps: appointment,
      })),
    [filteredAppointments],
  );

  function openNew(startDate?: Date) {
    setSelected(undefined);
    setSelectedStart(startDate ? toLocalInputValue(startDate) : undefined);
    setModalKey((key) => key + 1);
  }

  function openExisting(appointment: AppointmentCalendarItem) {
    setSelected({
      id: appointment.id,
      petId: appointment.petId,
      title: appointment.title,
      notes: appointment.notes ?? "",
      startDate: toLocalInputValue(appointment.startDate),
      endDate: toLocalInputValue(appointment.endDate),
      status: appointment.status,
      assignedVeterinarianId: appointment.assignedVeterinarianId ?? "",
    });
    setSelectedStart(undefined);
    setModalKey((key) => key + 1);
  }

  function persistCalendarMove(appointment: AppointmentCalendarItem, start?: Date | null, end?: Date | null) {
    if (!start) return;

    startTransition(async () => {
      const result = await updateAppointment({
        id: appointment.id,
        petId: appointment.petId,
        assignedVeterinarianId: appointment.assignedVeterinarianId ?? undefined,
        title: appointment.title,
        notes: appointment.notes ?? "",
        startDate: toLocalInputValue(start),
        endDate: toLocalInputValue(end ?? start),
        status: appointment.status,
      });

      if (result.ok) {
        toast.success("Cita reagendada");
      } else {
        toast.error(result.error ?? "No se pudo mover la cita");
      }
    });
  }

  return (
    <div className="appointment-calendar rounded-lg border border-white/10 bg-white/[0.06] p-3 shadow-2xl shadow-black/10 backdrop-blur-xl lg:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="grid w-full gap-3 lg:grid-cols-[1fr_180px_220px_auto] lg:items-center">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por mascota, propietario o servicio"
          />
          <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">Todos los estados</option>
            {Object.keys(statusColors).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
          <Select value={veterinarianFilter} onChange={(event) => setVeterinarianFilter(event.target.value)}>
            <option value="all">Todo el equipo</option>
            {veterinarians.map((veterinarian) => (
              <option key={veterinarian.id} value={veterinarian.id}>
                {veterinarian.name}
              </option>
            ))}
          </Select>
          <AppointmentModal pets={pets} veterinarians={veterinarians} />
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
          {Object.entries(statusColors).map(([status, color]) => (
            <span key={status} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
              {status}
            </span>
          ))}
        </div>
      </div>
      {modalKey > 0 ? (
        <AppointmentModal
          key={modalKey}
          pets={pets}
          veterinarians={veterinarians}
          appointment={selected}
          startDate={selectedStart}
          openOnMount
          trigger={<span className="hidden" />}
        />
      ) : null}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        buttonText={{ today: "Hoy", month: "Mes", day: "Dia", week: "Semana" }}
        allDaySlot={false}
        editable
        eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
        events={events}
        height="auto"
        locale="es"
        nowIndicator
        selectable
        slotMinTime="07:00:00"
        slotMaxTime="21:00:00"
        select={(info) => openNew(info.start)}
        dateClick={(info) => openNew(info.date)}
        eventClick={(info) => openExisting(info.event.extendedProps as AppointmentCalendarItem)}
        eventDrop={(info) =>
          persistCalendarMove(
            info.event.extendedProps as AppointmentCalendarItem,
            info.event.start,
            info.event.end,
          )
        }
        eventResize={(info) =>
          persistCalendarMove(
            info.event.extendedProps as AppointmentCalendarItem,
            info.event.start,
            info.event.end,
          )
        }
      />
    </div>
  );
}

function toLocalInputValue(value: Date | string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
